# QR Mesa — Frontend (Plan por fases)

> Cada fase es un entregable funcional. No avanzar a la siguiente hasta que la actual esté probada.

---

## Fase 1 — CRUD de Mesas (Admin)

**Objetivo**: El admin puede crear, editar y eliminar mesas desde el panel.

### Tareas
- [ ] Crear `useTableStore` (Zustand) con estado y acciones CRUD
- [ ] Crear página `/admin/tables/page.tsx`
- [ ] Componente `TableCard` — muestra nombre, número, capacidad, estado (activa/inactiva)
- [ ] Modal/Drawer `AddEditTableModal` — formulario: nombre, número de mesa, capacidad
- [ ] Botón para desactivar/activar mesa (soft delete)
- [ ] Agregar "Mesas" a la navegación del `DashboardLayout`
- [ ] Conectar con API: `POST/GET/PUT/DELETE /api/table`

### Criterio de aceptación
- Puedo crear una mesa "Mesa 1" con capacidad 4
- La veo en la lista, puedo editarla, desactivarla
- Los datos persisten (Supabase)

---

## Fase 2 — Generador de QR

**Objetivo**: Cada mesa tiene un QR que lleva a la URL pública de esa mesa.

### Tareas
- [ ] Botón "Ver QR" en cada `TableCard`
- [ ] Modal `TableQRModal` — muestra QR generado con la URL `/{slug}/mesa/{tableId}`
- [ ] Botón para descargar QR como imagen
- [ ] (Opcional) Diseño de soporte físico con logo + WiFi + QR (decisión 11 del doc)

### Criterio de aceptación
- Cada mesa tiene un QR que apunta a su URL única
- El QR se puede descargar como PNG

---

## Fase 3 — Onboarding del Cliente (escaneo)

**Objetivo**: El cliente escanea el QR, ingresa su nombre, y entra a la sesión.

### Tareas
- [ ] Crear ruta pública `/{slug}/mesa/{tableId}/page.tsx`
- [ ] Pantalla de onboarding: campo nombre + botón "Entrar"
- [ ] Al entrar: `POST /api/public/mesa/{tableId}/join` + generar `session_token` en localStorage
- [ ] Si ya tiene token en localStorage → reconexión directa (skip onboarding)
- [ ] Conectar Socket.io con auth `{ session_token, session_id, display_name }`
- [ ] Crear `useSessionStore` (Zustand) — estado de la sesión, guests, conexión socket

### Criterio de aceptación
- Escaneo el QR → veo pantalla de nombre → pongo "Sandra" → entro
- Si otro escanea el mismo QR → ve que Sandra ya está
- Si cierro y abro → reconecto automáticamente

---

## Fase 4 — Menú y Carrito

**Objetivo**: El cliente ve el menú y agrega items al carrito en tiempo real.

### Tareas
- [ ] Página del menú dentro de la sesión (reutilizar catálogo existente del storefront)
- [ ] Botón "Agregar" emite `cart:update` por socket
- [ ] Notificación flotante tipo toast: "Sandra agregó Pizza Margarita"
- [ ] Vista de carrito con items propios
- [ ] Vista de "Mesa" — qué pidió cada uno (read-only de los demás)
- [ ] Quitar items del carrito (antes de confirmar)

### Criterio de aceptación
- Sandra agrega Pizza → Carlos ve "Sandra agregó Pizza"
- Sandra quita Pizza → Carlos ve que se quitó
- Cada uno ve su carrito y el resumen de la mesa

---

## Fase 5 — Confirmar Ronda (Consenso)

**Objetivo**: El flujo de "Estoy listo" → countdown → ronda confirmada.

### Tareas
- [ ] Pantalla de confirmación: resumen de la mesa, quién confirmó, quién falta
- [ ] Botón "Estoy listo" → `round:ready` por socket
- [ ] Botón "Cancelar" → `round:unready`
- [ ] UI del countdown: barra/timer visible cuando se activa
- [ ] Mensaje: "Sandra y 2 más están listas. Enviando en 2:47..."
- [ ] Pantalla de éxito: "Pedido enviado a cocina — Ronda 1"
- [ ] Guest sin items ve: "No tenés items. Podés agregar algo del menú."

### Criterio de aceptación
- Mesa de 1: confirmo → sale directo
- Mesa de 2: Sandra confirma → countdown. Carlos confirma → sale
- Mesa de 3: Sandra confirma → "Sandra está lista". Carlos confirma → countdown. María confirma → sale
- Countdown expira → carritos pendientes se vacían, ronda sale

---

## Fase 6 — Vista de Cocina

**Objetivo**: La cocina ve los pedidos agrupados por mesa.

### Tareas
- [ ] Crear ruta `/cocina` o `/kitchen` (acceso por PIN)
- [ ] Pantalla de login: PIN de la sucursal
- [ ] Conectar socket con auth `{ role: 'kitchen', branch_id, pin }`
- [ ] Lista de pedidos agrupados por mesa, ordenados por hora
- [ ] Cada mesa es una tarjeta con items por ronda
- [ ] Botón "Listo" por item → `PATCH /api/kitchen/order/:id/item`
- [ ] Nuevos pedidos aparecen en tiempo real (`kitchen:new_order`)

### Criterio de aceptación
- Cocina ve "Mesa 1 — Ronda 1: Pizza x1, Cerveza x2"
- Marca "Listo" en la pizza → el item cambia de estado
- Nuevo pedido llega → aparece arriba automáticamente

---

## Fase 7 — Vista del Mozo

**Objetivo**: El mozo ve las mesas activas y puede intervenir.

### Tareas
- [ ] Crear ruta `/staff` o `/mozo` (acceso por JWT de staff)
- [ ] Lista de mesas activas con estado (pidiendo, esperando cocina, listo)
- [ ] Detalle de mesa: guests, items, estados
- [ ] Agregar persona virtual
- [ ] Tomar pedido en nombre de alguien
- [ ] Marcar pago por guest
- [ ] Notificación: "Pedido para Mesa 3 listo" (vibración + sonido)

### Criterio de aceptación
- Mozo ve Mesa 1 con Sandra y Carlos
- Agrega "Juan" como virtual → aparece en la sesión
- Marca a Sandra como pagada → se refleja en la mesa

---

## Fase 8 — Cuenta y Pagos

**Objetivo**: Cada cliente puede pedir su cuenta y pagar.

### Tareas
- [ ] Botón "Pedir mi cuenta" → `POST /api/public/mesa/session/:sid/bill`
- [ ] Pantalla de cuenta: items propios, total, opciones de propina
- [ ] Propina: 3%, 5%, 10%, 15%, custom (mínimo 5.000)
- [ ] División: "pago lo mío" (default), "partes iguales", "uno paga todo"
- [ ] Cuando todos pagan → `session:closed` → pantalla de "Gracias"

### Criterio de aceptación
- Sandra pide su cuenta → ve sus items y total
- Agrega 10% de propina → total actualizado
- Mozo marca pagado → Sandra ve "Pagado"
- Todos pagan → mesa se cierra automáticamente

---

## Notas técnicas

### Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: HeroUI + Tailwind CSS v4
- **Estado**: Zustand
- **Realtime**: socket.io-client
- **Tipos**: `@clickpy/shared` (Table, TableSession, TableGuest, TableOrderItem)

### Patrones a seguir (del codebase existente)
- Store pattern: ver `useProductStore`
- Modal responsive: Drawer (desktop) + Modal (mobile) — ver `AddProductModal`
- Forms: validación antes de submit, toast con `sonner`
- Loading: Skeleton de HeroUI
- Navegación: agregar items a `DashboardLayout`
