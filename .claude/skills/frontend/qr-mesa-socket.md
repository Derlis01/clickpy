---
name: qr-mesa-socket
description: Hook y clase singleton TableSocketManager para la conexion WebSocket del modulo QR Mesa en el frontend. Maneja la conexion, todos los listeners de eventos, y el cart bridge (sincronizacion carrito → socket). Usar cuando se trabaje con eventos en tiempo real de mesa.
---

# QR Mesa - Socket Manager (Frontend)

Archivo: `apps/web/src/hooks/useTableSocket.ts`

## Arquitectura

Patron **singleton class + hook facade**. La clase `TableSocketManager` mantiene una sola conexion Socket.io para toda la sesion de mesa, independientemente de cuantos componentes llamen al hook.

```
TableSocketManager (singleton, modulo-level)
    ├── socket: Socket | null
    ├── currentSessionId: string | null
    ├── cartUnsub: unsubscribe del cart store
    └── prevProducts: snapshot anterior del cart

useTableSocket() (hook de React)
    └── Lee sessionId/token/displayName del store
    └── Llama manager.connect() si hay sesion
    └── Expone emit() para componentes
```

## Clase TableSocketManager

### connect(sessionId, token, displayName)

- Si ya esta conectado a la misma sesion → no hace nada
- Si es sesion diferente o conexion inactiva → limpia con `disconnect()` primero
- Crea socket con auth `{ session_id, session_token, display_name }`
- Registra todos los listeners de eventos
- Llama `setupCartBridge()` al final

### disconnect()

Limpia todo en orden:
1. Cancela la suscripcion al cart store (`cartUnsub`)
2. Resetea `prevProducts`
3. Remueve todos los listeners del socket (`removeAllListeners()`)
4. Desconecta el socket
5. Limpia `currentSessionId`

### setupCartBridge() (privado)

Observa `usePublicCart` con `subscribe()`. Compara `prevProducts` con el estado actual para detectar add/remove y emite `cart:update` al socket. Esto reemplaza la logica que antes vivia en componentes React.

```
Cart store cambia → bridge detecta diferencia de longitud
  → item agregado: emit cart:update { action: 'add', product_id, ... }
  → item removido: emit cart:update { action: 'remove', product_id, ... }
```

## Eventos que el cliente escucha

| Evento | Accion |
|---|---|
| `connect` | `setConnected(true)` |
| `disconnect` | `setConnected(false)` |
| `guest:presence` | `setGuests()`, activa countdown si viene |
| `guest:joined` | `addGuest()` + toast (no si soy yo) |
| `guest:left` | `removeGuest()` |
| `cart:item_added` | `addGuestItem()` + toast (si es de otro guest) |
| `cart:item_removed` | `removeGuestItem()` + toast (si es de otro guest) |
| `round:guest_ready` | toast si es otro guest |
| `round:guest_unready` | toast si es otro guest |
| `countdown:started` | `setCountdown({ active: true, ends_at })` |
| `countdown:reset` | `setCountdown({ active: false })` |
| `countdown:expired` | `setCountdown({ active: false })` |
| `round:confirmed` | `setLastRoundResult()`, `clearCart()`, `incrementRound()`, toast.success |
| `round:error` | toast.error |
| `cart:error` | toast.error |
| `session:closed` | toast.info |

## Hook useTableSocket()

```typescript
const { emit } = useTableSocket()
// emit('round:ready')
// emit('round:unready')
```

El `useEffect` conecta cuando hay `sessionId + token + displayName` en el store. En el cleanup, solo desconecta si `sessionId` ya no existe en el store (el usuario salio de la mesa), no en cada render.

## Relaciones

- Depende de: `tableSessionStore`, `usePublicCart`
- Es usado por: `MesaPage` (via `MesaStorefront`), `MesaDrawer`

## Notas para agentes

- El cart bridge detecta cambios por longitud del array. Si se reemplaza un item (misma cantidad), no emite. Correcto para el flujo actual.
- Los listeners usan `getState()` directamente, no el estado del closure. Esto evita stale closures en callbacks de socket.
- No llamar `disconnect()` manualmente desde componentes. El cleanup del `useEffect` lo maneja automaticamente.

## Ultima actualizacion

2026-03-21 — Reescrito como clase singleton. Cart bridge integrado en el manager. `connect()` verifica sesion activa antes de reconectar. `disconnect()` limpia listeners, socket, y cart bridge.
