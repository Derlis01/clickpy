# Modulo Orders — Backend

## Endpoints

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/public/order` | No | Crear pedido desde storefront |
| GET | `/api/orders` | Si | Listar pedidos del branch (filtros: status, type, from, to) |
| GET | `/api/orders/:id` | Si | Detalle de un pedido |
| PATCH | `/api/orders/:id/status` | Si | Cambiar estado (+ broadcast socket) |

## Archivos

- `order.controller.ts` — Endpoints publicos y autenticados
- `order.service.ts` — Logica de negocio, inyecta RealtimeGateway para broadcasts
- `order.repository.ts` — Queries Supabase: createOrder, findByBranch, findById, updateStatus
- `dto/create-order.dto.ts` — Validacion para creacion
- `dto/update-order-status.dto.ts` — Validacion para cambio de estado (IsIn de los 6 estados)
- `order.module.ts` — Importa RealtimeModule para inyeccion del gateway

## Flujo de estados

`pending` → `confirmed` → `preparing` → `ready` → `delivered`
En cualquier punto puede ir a `cancelled`.

## Broadcasts socket

Al crear un pedido (storefront):
- `kitchen:new_order` → room `kitchen:{branchId}`
- `floor:new_order` → room `floor:{branchId}`

Al cambiar estado:
- `order:status_updated` → room `kitchen:{branchId}`
- `floor:order_updated` → room `floor:{branchId}`

Los pedidos de mesa (dinein) ya emiten `kitchen:new_order` desde el RealtimeGateway al confirmar rondas.

## Tabla DB: orders

Columnas clave: id, branch_id, order_number (auto-increment por branch via trigger), customer_id, customer_phone, customer_name, items (JSONB), subtotal, delivery_fee, total, currency, status, type (delivery/pickup/dinein), payment_method, payment_status, notes, delivery_address (JSONB), table_number, table_session_id, guest_id, round_number, created_at, updated_at.
