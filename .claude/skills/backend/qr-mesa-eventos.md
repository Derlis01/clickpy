---
name: qr-mesa-eventos
description: Tabla completa de eventos Socket.io del modulo QR Mesa. Que emite cada rol, que recibe, y en que momento. Usar como referencia rapida para frontend o debugging.
---

# QR Mesa - Eventos Socket.io

## Eventos que emite el CLIENT (guest)

| Evento | Payload | Cuando |
|---|---|---|
| `cart:update` | `{ action: 'add'\|'remove', product_id, product_name?, quantity?, price?, notes? }` | Agrega/saca item del carrito |
| `round:ready` | (sin payload) | Guest confirma que esta listo |
| `round:unready` | (sin payload) | Guest cancela su confirmacion |

## Eventos que RECIBE el guest

| Evento | Payload | Cuando |
|---|---|---|
| `guest:presence` | `{ guests: [{ display_name, is_ready, has_items, is_connected }], countdown }` | Al conectarse (estado actual de la mesa) |
| `guest:joined` | `{ display_name, guest_id }` | Otro guest se unio a la mesa |
| `guest:left` | `{ display_name }` | Otro guest se desconecto |
| `cart:item_added` | `{ guest_name, product_id, product_name, quantity }` | Otro guest agrego un item |
| `cart:item_removed` | `{ guest_name, product_id }` | Otro guest saco un item |
| `cart:error` | `{ code, message }` | Error de carrito (SESSION_CLOSED, ALREADY_IN_KITCHEN) |
| `round:guest_ready` | `{ guest_name }` | Otro guest confirmo (cuando no arranca countdown) |
| `round:guest_unready` | `{ guest_name }` | Otro guest cancelo confirmacion |
| `round:confirmed` | `{ round, order_id, items }` | Ronda confirmada, pedido enviado a cocina |
| `round:error` | `{ code, message?, product_id? }` | Error (EMPTY_CART, PRODUCT_UNAVAILABLE) |
| `countdown:started` | `{ ends_at }` | Countdown arranco (ISO timestamp de fin) |
| `countdown:reset` | `{ reason }` | Countdown cancelado (new_guest_with_items, guest_unready) |
| `countdown:expired` | `{ cleared_guests }` | Countdown expiro, guests sin confirmar fueron limpiados |
| `bill:requested` | `{ ... }` | Alguien pidio la cuenta |
| `bill:paid` | `{ guest_id, guest_name, payment_status }` | Un guest fue marcado como pagado |
| `order:status_changed` | `{ order_id, item_index, status }` | Cocina cambio estado de un item |
| `session:closed` | `{ reason }` | Sesion cerrada (all_paid, staff_closed) |

## Eventos que RECIBE la cocina (`kitchen:{branchId}`)

| Evento | Payload | Cuando |
|---|---|---|
| `kitchen:new_order` | `{ order_id, session_id, table_name, source, items, round }` | Nuevo pedido confirmado |

## Eventos que RECIBE el mozo/floor (`floor:{branchId}`)

| Evento | Payload | Cuando |
|---|---|---|
| `floor:table_updated` | `{ session_id, table_name, action, round? }` | Algo paso en una mesa (item_added, round_confirmed) |
| `floor:item_ready` | `{ order_id, table_name, session_id }` | Un item esta listo para servir |

## Rooms de Socket.io

| Room | Quien esta | Para que |
|---|---|---|
| `table:{session_id}` | Todos los guests de esa mesa | Eventos de carrito, rondas, presencia |
| `kitchen:{branch_id}` | Vista de cocina de esa sucursal | Nuevos pedidos |
| `floor:{branch_id}` | Mozos de esa sucursal | Updates de mesas, items listos |

## Auth en handshake

Se pasa en `socket.handshake.auth`:

```javascript
// Guest
{ session_token: "xxx", session_id: "abc123", display_name: "Sandra" }

// Kitchen
{ role: "kitchen", branch_id: "branch-1", pin: "1234" }

// Staff
{ role: "staff", branch_id: "branch-1", jwt: "eyJ..." }
```
