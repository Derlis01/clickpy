# Modulo Orders — Frontend (Admin)

## Pagina

`/admin/orders` — Vista unificada de todos los pedidos (delivery, retiro, mesa).

## Archivos

### Infraestructura
- `services/orderService.ts` — API calls: getOrders(filters), getOrder(id), updateOrderStatus(id, status)
- `store/orderStore.ts` — Zustand: orders[], viewMode (kanban|list), filters, selectedOrder, fetchOrders, addOrder, updateOrder, updateOrderStatus
- `hooks/useOrderSocket.ts` — Conecta como role `kitchen` al socket, escucha `kitchen:new_order` y `order:status_updated`

### Componentes
- `app/admin/orders/page.tsx` — Pagina principal, usa useOrderSocket + fetchOrders
- `components/OrdersToolbar.tsx` — Filtros (estado, tipo), toggle kanban/lista, boton refresh
- `components/OrderKanban.tsx` — 5 columnas por estado, renderiza OrderCard
- `components/OrderList.tsx` — Tabla con columnas: #, cliente, tipo, estado, items, total, fecha
- `components/OrderCard.tsx` — Card compacto: numero, badge tipo, nombre, items count, total, tiempo
- `components/OrderDetailModal.tsx` — Detalle completo, items, progreso de estado, boton avanzar/cancelar

### Navegacion
- `DashboardLayout.tsx` — Agrego "Pedidos" con icono Clipboard entre Home y Productos
- `NavigationMobile.tsx` — Agrego tab "Pedidos" para mobile

## Socket

El hook `useOrderSocket(branchId)` se conecta como `role: 'kitchen'` y escucha:
- `kitchen:new_order` → agrega pedido al store
- `order:status_updated` → actualiza estado del pedido en store

El branchId se obtiene via `getMainBranchId()` exportado desde `commerceService.ts`.

## Tipos

Usa `Order` y `OrderItem` de `@clickpy/shared` (packages/shared/src/order.ts).

## Patrones

- Kanban: columnas pending/confirmed/preparing/ready/delivered con colores (yellow/blue/orange/green/gray)
- Status flow: boton "Mover a X" avanza al siguiente estado en el flujo lineal
- Filtros: por status y type, aplicados via query params al backend
- Real-time: pedidos nuevos aparecen instantaneamente via socket
