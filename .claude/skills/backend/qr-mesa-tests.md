---
name: qr-mesa-tests
description: Tests E2E del modulo QR Mesa. Helpers de test, smoke test, suite completa, y patrones para escribir nuevos tests con Socket.io. Usar cuando se necesite correr, debuggear, o agregar tests.
---

# QR Mesa - Tests E2E

Directorio: `apps/api/test/realtime/`

## Archivos

| Archivo | Que tiene |
|---|---|
| `helpers.ts` | Utilidades para crear app de test, conectar sockets, esperar eventos |
| `basic.e2e-spec.ts` | Smoke test (10 tests basicos) |
| `table-session.e2e-spec.ts` | Suite completa (~57 tests) |

## Como correr

```bash
# Smoke test
pnpm --filter api test:e2e -- --testPathPatterns="realtime/basic" --forceExit

# Suite completa
pnpm --filter api test:e2e -- --testPathPatterns="realtime/table-session" --forceExit

# Desde el directorio api
npx jest --config ./test/jest-e2e.json --testPathPatterns="realtime/basic" --no-coverage --forceExit
```

## Helpers clave

### `createTestApp()`
Crea app NestJS de test con Socket.io. Escucha en puerto random. Retorna `{ app, port }`.

### `connectGuest(port, sessionId, { name, token? })`
Conecta un socket simulando un guest. Genera token random si no se pasa.

### `connectKitchen(port, branchId, pin)`
Conecta un socket simulando cocina.

### `connectFloor(port, branchId, jwt)`
Conecta un socket simulando mozo.

### `waitForGuestReady(socket)`
Espera a que el guest este **completamente registrado** en el server (recibe `guest:presence`). Usar SIEMPRE en vez de `waitForConnect` para guests.

### `waitForConnect(socket)`
Espera conexion transport-level. Usar solo para kitchen/staff (no hacen async en handleConnection).

### `waitForEvent(socket, event, timeoutMs?)`
Espera un evento especifico. Timeout default 5s.

### `disconnectAll(...sockets)`
Desconecta multiples sockets.

### `apiCall(port, method, path, body?, token?)`
Hace llamada REST al server de test.

## Patrones importantes

### Race condition: waitForGuestReady vs waitForConnect

`handleConnection` es **async** para guests (hace llamadas a DB). Si usas `waitForConnect`, el socket se marca como conectado ANTES de que el server termine de procesarlo. El guest no esta en la room todavia.

**Siempre usar `waitForGuestReady` para guests.**

### Array.map con funciones que tienen defaults

```typescript
// MAL — map pasa (element, index, array), index sobreescribe timeoutMs
await Promise.all(guests.map(waitForGuestReady));

// BIEN
await Promise.all(guests.map((g) => waitForGuestReady(g)));
```

### IDs de test no son UUIDs

Los tests usan IDs como `smoke-session-1` que no son UUIDs validos. Las llamadas a DB fallan pero el sistema es resiliente:
- `validateProducts` catch → skip validation
- `createRoundOrder` catch → round procede sin persistencia
- `joinSession` catch → guest se registra solo en memoria

### Aislamiento entre tests

Cada test usa un `sessionId` unico (ej: `smoke-session-1`, `smoke-session-2`). El `SessionStateManager` es singleton compartido pero cada sesion es independiente.

## Smoke test — 10 tests

1. Server levanta
2. Guest se conecta
3. Kitchen se conecta
4. Staff se conecta
5. Guest recibe presence al conectarse
6. Segundo guest genera guest:joined
7. Agregar item notifica al otro guest
8. Mesa de 1: ronda sale directo
9. Mesa de 2: countdown + consenso
10. Confirmar sin items = error EMPTY_CART
