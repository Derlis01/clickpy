---
name: qr-mesa-realtime
description: Modulo Realtime de QR Mesa. Gateway Socket.io, SessionStateManager (estado en memoria), CountdownManager, SessionLock, auth adapter, y broadcaster. Usar cuando se trabaje con eventos, carritos, rondas, o countdown.
---

# QR Mesa - Modulo Realtime

Directorio: `src/modules/realtime/`

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `realtime.gateway.ts` | Cerebro del tiempo real. Maneja conexiones, carritos, rondas |
| `session-state.manager.ts` | Estado en memoria: sesiones, guests, carritos, ready status |
| `countdown.manager.ts` | Timers de countdown por sesion |
| `session-lock.service.ts` | Mutex por sesion para serializar operaciones concurrentes |
| `realtime-auth.adapter.ts` | Custom IoAdapter para auth en handshake |
| `realtime-broadcaster.service.ts` | Implementa RealtimeBroadcaster para que REST use Socket |
| `realtime.module.ts` | Modulo NestJS, exporta SessionStateManager y RealtimeBroadcaster |

## RealtimeGateway — Eventos principales

### Conexion (`handleConnection`)

1. Detecta rol por `socket.handshake.auth` (guest/kitchen/staff)
2. Kitchen y Staff: join a room y return
3. Guest:
   - Busca/crea sesion en memoria (SessionStateManager)
   - Si la sesion esta cerrada → desconecta con `SESSION_CLOSED`
   - Si el guest ya existia (reconexion) → **desconecta el socket viejo** antes de registrar el nuevo, para evitar sockets duplicados en la misma room
   - Si es guest nuevo → registra en DB (best-effort) y agrega a memoria
   - Join a room `table:{sessionId}`
   - Emite `guest:presence` al guest que se conecta
   - Emite `guest:joined` a los demas de la mesa (solo si es guest nuevo)

### Carrito (`cart:update`)

```
Guest emite → { action: 'add'|'remove', product_id, product_name, quantity, price }
```

- `add`: agrega a `guest.cart[]` en memoria, emite `cart:item_added` a la mesa
- `remove`: saca del cart, emite `cart:item_removed`. Si el item ya fue a cocina → error `ALREADY_IN_KITCHEN`
- Si hay countdown activo y un guest nuevo agrega items → cancela countdown

### Ronda Ready (`round:ready`)

Logica de consenso:

```
guest.cart vacio?  →  error EMPTY_CART

Mesa de 1 persona?  →  confirmRound() directo

Ronda 2+?  →  confirmRoundForGuest() (libre, cada uno solo)

Ronda 1 (consenso):
  Todos listos?     →  confirmRound()
  Threshold alcanzado?  →  countdown starts
  Si no?            →  emite round:guest_ready a los demas
```

### confirmRound (interno)

1. Valida productos en DB (best-effort, skip si DB falla)
2. Crea orden en DB (best-effort, ronda procede si DB falla)
3. Emite `round:confirmed` a `table:{sessionId}`
4. Emite `kitchen:new_order` a `kitchen:{branchId}`
5. Emite `floor:table_updated` a `floor:{branchId}`
6. Resetea carritos y estado ready en memoria

## SessionStateManager

Estado en memoria (Map). Source of truth para estado "vivo".

```typescript
SessionState {
  sessionId, branchId, currentRound, roundConfirmed, closed,
  guests: Map<token, GuestState>,  // token = session_token del guest
  tableName
}

GuestState {
  displayName, socketId, guestId, cart: CartItem[],
  isReady, allergies, isVirtual
}
```

Metodos clave:
- `getParticipants()` — guests con items en carrito
- `allReady()` — todos los participantes confirmaron?
- `collectReadyItems()` — junta items de guests listos para la orden
- `resetRound()` — limpia carritos, incrementa ronda
- `clearPendingCarts()` — limpia carritos de los que no confirmaron (countdown expiro)

## CountdownManager

Timer por sesion. Cuando el threshold de pendientes se alcanza, arranca countdown.

**Thresholds** (segun cantidad de participantes):
- 1 persona: sin countdown (sale directo)
- 2-9: countdown cuando queda 1 pendiente
- 10-12: cuando quedan 2
- 13-17: cuando quedan 3
- 18+: 20% pendientes

Duracion: `COUNTDOWN_SECONDS` env var (180 prod, 3 tests).

Cuando expira: limpia carritos de pendientes, confirma ronda solo con los que estaban listos.

## SessionLockService

Mutex in-memory por sesion. Serializa operaciones concurrentes (ej: dos guests confirman al mismo milisegundo).

```typescript
const release = await this.lock.acquire(sessionId);
try { /* operacion */ } finally { release(); }
```

## RealtimeAuthAdapter

Custom `IoAdapter` que agrega middleware al handshake de Socket.io. Valida:
- Guest: necesita `session_token` + `session_id`
- Kitchen: necesita `role: 'kitchen'` + `branch_id` + `pin`
- Staff: necesita `role: 'staff'` + `branch_id` + `jwt`

## RealtimeBroadcasterService

Implementa la clase abstracta `RealtimeBroadcaster` (definida en table-session). Permite que los controllers REST emitan eventos Socket sin importar el gateway directamente.

```typescript
// Desde un controller REST:
this.realtimeBroadcaster.toTable(sid, 'bill:requested', data);
this.realtimeBroadcaster.toFloor(branchId, 'floor:item_ready', data);
```

## Ultima actualizacion

2026-03-21 — Fix reconexion de guests: al reconectar un guest con token existente, se desconecta el socket viejo (`oldSocket.leave()` + `oldSocket.disconnect(true)`) antes de actualizar `socketId`. Evita sockets duplicados en la room `table:{sessionId}`.
