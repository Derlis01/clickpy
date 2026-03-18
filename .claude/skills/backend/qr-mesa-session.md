---
name: qr-mesa-session
description: Modulo TableSession de QR Mesa. Controller REST, service con logica de negocio, repository Supabase, DTOs, y RealtimeBroadcaster interface. Usar cuando se trabaje con endpoints, sesiones, guests, ordenes, o pagos.
---

# QR Mesa - Modulo TableSession

Directorio: `src/modules/table-session/`

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `table-session.controller.ts` | Endpoints REST (public, kitchen, staff) |
| `table-session.service.ts` | Logica de negocio |
| `table-session.repository.ts` | Queries a Supabase |
| `dto/join-session.dto.ts` | DTOs de validacion |
| `realtime-broadcaster.interface.ts` | Clase abstracta para desacoplar REST de Socket |
| `table-session.module.ts` | Modulo NestJS, usa forwardRef a RealtimeModule |

## Endpoints REST

### Publicos (cliente desde celular) — `@Public()`

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/public/mesa/:tableId/session` | Obtener o crear sesion para una mesa |
| POST | `/public/mesa/:tableId/join` | Unirse a la sesion (nombre + token) |
| POST | `/public/mesa/session/:sid/bill` | Pedir la cuenta |
| POST | `/public/mesa/session/:sid/confirm` | Forzar confirmacion de ronda desde REST |
| POST | `/public/mesa/session/:sid/allergies` | Actualizar alergias del guest |
| GET | `/public/mesa/session/:sid/orders` | Ver ordenes de la sesion |

### Cocina

| Metodo | Ruta | Que hace |
|---|---|---|
| GET | `/kitchen/:branchId/orders` | Ver ordenes activas de la sucursal |
| PATCH | `/kitchen/order/:orderId/item` | Cambiar estado de un item (preparing/ready) |

### Staff (mozo) — requieren JWT

| Metodo | Ruta | Que hace |
|---|---|---|
| POST | `/staff/table/:sid/guest` | Agregar guest virtual (persona sin celular) |
| POST | `/staff/table/:sid/order` | Crear orden manual del mozo |
| PATCH | `/staff/table/:sid/guest/:gid/payment` | Marcar pago de un guest |
| DELETE | `/staff/table/:sid/guest/:gid` | Remover guest de la sesion |
| PATCH | `/staff/table/:sid/close` | Cerrar mesa manualmente |
| GET | `/staff/tables` | Listar mesas activas (pendiente) |

## Service — Metodos clave

- `getOrCreateSession(tableId)` — busca sesion activa o crea nueva
- `joinSession(sessionId, token, name, allergies?)` — registra guest en DB
- `requestBill(sessionId, guestToken)` — calcula montos por guest
- `createRoundOrder(sessionId, branchId, round, items)` — persiste orden en DB
- `markPayment(sessionId, guestId, status)` — marca pagado/no pagado, detecta si todos pagaron
- `addVirtualGuest(sessionId, name)` — guest sin celular (mozo lo agrega)
- `removeGuest(sessionId, guestId)` — saca guest de la sesion
- `validateProducts(productIds)` — valida que los productos existan y esten activos
- `updateItemStatus(orderId, itemIndex, status)` — cocina cambia estado de item
- `getKitchenOrders(branchId)` — ordenes activas para la cocina
- `log(branchId, action, sessionId, meta)` — log de actividad

## Repository — Tablas que toca

- `table_sessions` — sesiones activas
- `table_guests` — guests registrados en cada sesion
- `orders` — pedidos (con `table_session_id` y `round_number`)
- `activity_log` — log de acciones
- `products` — validacion de productos
- `tables` — info de mesas fisicas

## DTOs

- `JoinSessionDto` — `{ token: string, name: string, allergies?: string }`
- `RequestBillDto` — `{ guest_token: string }`
- `UpdateAllergiesDto` — `{ guest_token: string, allergies: string }`
- `AddVirtualGuestDto` — `{ display_name: string }`
- `StaffOrderDto` — `{ guest_name: string, items: [...] }`
- `UpdatePaymentDto` — `{ status: 'paid' | 'not_paid' }`
- `UpdateItemStatusDto` — `{ item_index: number, status: string }`

## RealtimeBroadcaster (interface)

Clase abstracta que desacopla los controllers REST del gateway Socket.io:

```typescript
abstract class RealtimeBroadcaster {
  abstract toTable(sessionId, event, data): void;
  abstract toKitchen(branchId, event, data): void;
  abstract toFloor(branchId, event, data): void;
  abstract triggerConfirmRound(sessionId): void;
  abstract addStaffItems(sessionId, guestName, items): void;
}
```

Implementada por `RealtimeBroadcasterService` en el modulo Realtime.
