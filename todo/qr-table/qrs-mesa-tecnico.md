# QRs Mesa — Plan Técnico

> **Estado**: Arquitectura definida, pre-implementación
> **Última actualización**: 2026-03-12
> **Prerequisito**: Leer `qrs-mesa.md` para las decisiones funcionales

---

## Stack Actual

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS 11 + Express |
| DB | Supabase PostgreSQL |
| Auth | Supabase Auth + JWT |
| Frontend | Next.js 16 + React 19 |
| State | Zustand |
| Real-time | Ninguno — actualmente solo REST |

---

## Decisiones Técnicas

### 1. Transporte en Tiempo Real → Socket.io

**Elegido**: `socket.io` + `@nestjs/websockets` + `@nestjs/platform-socket.io`

**Por qué**: necesitamos eventos custom (countdown, presencia, "Sandra agregó Pizza"), rooms por mesa, y lógica server-side al recibir eventos. NestJS tiene soporte nativo con `@WebSocketGateway`. Rooms resuelven exactamente el caso de mesas. Reconexión automática es clave para mobile con WiFi inestable. Desde v4.4.0 puede usar µWebSockets.js como engine si necesitamos más performance sin cambiar la API.

**Descartamos Supabase Realtime** porque no permite ejecutar lógica server-side al recibir eventos — el countdown y las validaciones de concurrencia serían hacks escribiendo en DB solo para triggear eventos. **Descartamos ws puro** porque habría que reimplementar rooms, reconexión y broadcasting desde cero. **Descartamos µWebSockets.js directo** porque no tiene integración NestJS y la API es de bajo nivel.

**Fuentes**: [NestJS Gateways](https://docs.nestjs.com/websockets/gateways) · [Socket.io Rooms](https://socket.io/docs/v4/rooms/) · [Socket.io vs Supabase (2026)](https://ably.com/compare/socketio-vs-supabase)

---

### 2. Countdown Server-Side → setTimeout (MVP)

**Elegido**: `setTimeout` con un `Map<sessionId, NodeJS.Timeout>` en memoria.

**Por qué**: un restaurante promedio tiene 10-30 mesas. Son 10-30 timers máximo. `setTimeout` maneja esto sin problema, sin dependencias extra. El countdown es efímero — si el servidor se reinicia, los timers se pierden pero no es crítico (las mesas siguen activas, solo se pierde el countdown en curso).

**Migración futura**: cuando necesitemos múltiples instancias o timers que sobrevivan a deploys → **BullMQ con Redis**. La interfaz del CountdownManager no cambia — solo la implementación interna.

**Descartamos node-cron** porque no está diseñado para timers dinámicos — haría polling cada segundo revisando si algo expiró.

**Fuentes**: [BullMQ Scheduled Tasks](https://betterstack.com/community/guides/scaling-nodejs/bullmq-scheduled-tasks/) · [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)

---

### 3. Concurrencia → Lock en memoria (MVP)

**Elegido**: `Map<sessionId, Promise<void>>` — un mutex por sesión que serializa operaciones.

**Por qué**: los locks son efímeros (duran milisegundos). Evitan que dos personas confirmen la misma ronda al mismo tiempo, o que un countdown expire mientras alguien está confirmando. No necesitan persistir. Un solo servidor = un solo `Map`.

**Migración futura**: múltiples instancias → **Redlock con Redis**. Misma interfaz.

**Descartamos Advisory Locks de Postgres** porque usar una conexión de DB para un lock de milisegundos es desperdiciar recursos.

**Fuentes**: [Distributed Locking in NestJS](https://medium.com/@ahsan-ali-mansoor/eliminating-race-conditions-in-nestjs-with-distributed-locking-04d16826dece) · [MurLock](https://github.com/felanios/murlock)

---

### 4. Auth del WebSocket → Handshake + Middleware Adapter

**Elegido**: autenticación una sola vez al conectar, en el handshake de Socket.io. Un custom WebSocket adapter en NestJS valida el token antes de que la conexión llegue al gateway.

Tres tipos de conexión:
- **Guest (cliente)**: `session_token` del localStorage — no expira
- **Mozo**: JWT de Supabase con rol staff
- **Cocina**: PIN de sucursal

**Por qué**: una validación por conexión es suficiente. Los tokens de guests no expiran. Los JWT del mozo son de larga duración (un turno entero). Validar cada mensaje sería overhead innecesario.

**Fuentes**: [WebSocket Auth NestJS](https://dev.to/mouloud_hasrane_c99b0f49a/websocket-authentication-in-nestjs-handling-jwt-and-guards-4j27) · [Best Way to Auth WebSockets NestJS](https://preetmishra.com/blog/the-best-way-to-authenticate-websockets-in-nestjs)

---

### 5. Rooms → 1 room por mesa + rooms de servicio

```
table:{session_id}    → guests de una mesa específica
kitchen:{branch_id}   → cocina(s) del local
floor:{branch_id}     → mozo(s) del local
```

**Por qué**: un sistema de restaurante open-source (KitchenAsty) usa exactamente este patrón — rooms individuales por mesa + room compartido para cocina. Es el consenso en la industria. Broadcast solo a quien le interesa, sin filtrado client-side.

**Fuente**: [KitchenAsty Architecture](https://dev.to/mighty840/design-decisions-behind-kitchenasty-an-open-source-restaurant-management-system-650)

---

### 6. Notificaciones al Mozo → Sonido + Vibración

**Elegido**: Sonner (ya en el proyecto) para toast visual + `navigator.vibrate()` con feature detection + sonido corto con Audio API.

**Limitación iOS**: la Vibration API **no funciona en Safari iOS** (Apple no lo permite). En iOS: solo toast + sonido.

**Descartamos Notification API del browser** porque requiere permiso explícito y no funciona bien en iOS sin PWA. El mozo ya tiene la app abierta — no necesita push del browser.

---

### 7. Deploy → Oracle Cloud Free Tier

**Elegido**: Oracle Cloud Infrastructure — Always Free Tier, región Brasil São Paulo.

**Recursos gratis (sin expiración)**:
- VM ARM Ampere A1: hasta 4 cores + 24GB RAM
- O 2 VMs AMD: 1/8 OCPU + 1GB RAM cada una
- Load Balancer incluido (para SSL)
- 10TB outbound data/mes

**Por qué**: es la opción más potente y cuesta $0. La VM ARM tiene 10x más recursos que lo que Railway ofrece por $15/mes. Desde Paraguay, Brasil São Paulo tiene ~20-40ms de latencia — excelente para WebSocket.

**Nota**: las instancias ARM pueden tener problemas de capacidad (alta demanda). Si no hay disponibilidad ARM → usar las 2 VMs AMD gratis (más limitadas pero suficientes). Si Oracle falla → **Fly.io** como backup ($0-5/mes).

**Setup**: SSH + Node.js (nvm) + PM2 (process manager) + Nginx (reverse proxy + WebSocket upgrade) + Let's Encrypt (SSL).

**Descartamos Railway** ($10-15/mes) — demasiado caro para MVP. **Descartamos Render** ($7/mes) — el free tier duerme y mata WebSocket. **Fly.io** queda como backup viable.

**Fuentes**: [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) · [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)

---

## Paquetes a instalar

```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io --filter @clickpy/api
pnpm add socket.io-client --filter @clickpy/web
```

---

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cliente A   │     │  Cliente B   │     │ Mozo/Cocina │
│  (browser)   │     │  (browser)   │     │  (browser)  │
└──────┬───────┘     └──────┬───────┘     └──────┬──────┘
       │ socket.io          │ socket.io          │ socket.io
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   NestJS API   │
                    │                │
                    │  REST          │ ← datos (CRUD, órdenes, auth)
                    │  WS Gateway    │ ← eventos (presencia, countdown)
                    │  Countdown Mgr │ ← timers (setTimeout + Map)
                    │  Session Lock  │ ← mutex (Map + Promise)
                    │                │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   Supabase     │
                    │   PostgreSQL   │
                    └────────────────┘
```

### Principio: REST para datos, Socket para eventos

| Acción | Canal | Por qué |
|--------|-------|---------|
| CRUD mesas, confirmar pedido, pedir cuenta | REST | Escritura en DB + validaciones |
| Presencia, countdown, "Sandra agregó..." | Socket | Efímero, no va a DB |
| Cocina marca "listo" | REST → socket broadcast | Persiste en DB, luego notifica |

---

## Estructura de Módulos

```
src/modules/
├── table/                          ← CRUD de mesas (admin)
│   ├── table.module.ts
│   ├── table.controller.ts
│   ├── table.service.ts
│   ├── table.repository.ts
│   └── dto/
│
├── table-session/                  ← Sesiones activas
│   ├── table-session.module.ts
│   ├── table-session.controller.ts
│   ├── table-session.service.ts
│   ├── table-session.repository.ts
│   └── dto/
│
├── kitchen/                        ← Vista de cocina
│   ├── kitchen.module.ts
│   ├── kitchen.controller.ts
│   ├── kitchen.service.ts
│   └── dto/
│
└── realtime/                       ← WebSocket Gateway
    ├── realtime.module.ts
    ├── realtime.gateway.ts
    ├── realtime-auth.adapter.ts
    ├── countdown.manager.ts
    ├── session-lock.service.ts
    └── rooms.service.ts
```

---

## Eventos de Socket

### Servidor → Clientes

| Evento | Room | Cuándo |
|--------|------|--------|
| `guest:joined` | `table:{sid}` | Alguien se une |
| `guest:left` | `table:{sid}` | Alguien se desconecta |
| `guest:presence` | `table:{sid}` | Al conectar, estado actual |
| `cart:item_added` | `table:{sid}` | "Sandra agregó Pizza Margarita" |
| `cart:item_removed` | `table:{sid}` | Alguien quitó item |
| `round:guest_ready` | `table:{sid}` | Alguien marcó "Estoy listo" |
| `round:guest_unready` | `table:{sid}` | Desmarcó "listo" |
| `countdown:started` | `table:{sid}` | Countdown activado (con `ends_at`) |
| `countdown:reset` | `table:{sid}` | Reiniciado por nuevo guest |
| `countdown:expired` | `table:{sid}` | Llegó a 0 |
| `round:confirmed` | `table:{sid}` | Ronda enviada a cocina |
| `order:status_changed` | `table:{sid}` | Cocina cambió estado de item |
| `bill:requested` | `table:{sid}` | Alguien pidió su cuenta |
| `bill:paid` | `table:{sid}` | Mozo marcó pagado |
| `kitchen:new_order` | `kitchen:{bid}` | Nuevo pedido (mesa o delivery) |
| `kitchen:item_updated` | `kitchen:{bid}` | Estado de item actualizado |
| `floor:table_updated` | `floor:{bid}` | Mesa cambió estado/total |
| `floor:item_ready` | `floor:{bid}` | Items listos para llevar |

### Clientes → Servidor

| Evento | Quién | Qué hace el servidor |
|--------|-------|---------------------|
| `cart:update` | Guest | Broadcast a la room |
| `round:ready` | Guest | Evalúa countdown/confirmación |
| `round:unready` | Guest | Cancela countdown si aplica |

---

## Modelo de Datos

### Tablas nuevas

```sql
CREATE TABLE tables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  number      INTEGER,
  capacity    INTEGER,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE table_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id      UUID NOT NULL REFERENCES tables(id),
  branch_id     UUID NOT NULL REFERENCES branches(id),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paying', 'closed')),
  current_round INTEGER DEFAULT 1,
  opened_at     TIMESTAMPTZ DEFAULT now(),
  closed_at     TIMESTAMPTZ,
  total         NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE table_guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  session_token   TEXT NOT NULL,
  display_name    TEXT,
  allergies       TEXT,
  joined_at       TIMESTAMPTZ DEFAULT now(),
  payment_status  TEXT DEFAULT 'pending'
                  CHECK (payment_status IN ('pending', 'paid', 'not_paid')),
  amount_due      NUMERIC(12,2) DEFAULT 0,
  tip_amount      NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE table_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   UUID NOT NULL,
  session_id  UUID,
  event       TEXT NOT NULL,
  data        JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_tables_branch ON tables(branch_id);
CREATE INDEX idx_sessions_table ON table_sessions(table_id);
CREATE INDEX idx_sessions_branch_status ON table_sessions(branch_id, status);
CREATE INDEX idx_guests_session ON table_guests(session_id);
CREATE UNIQUE INDEX idx_guests_token_session ON table_guests(session_token, session_id);
CREATE INDEX idx_logs_branch_event ON table_logs(branch_id, event);
CREATE INDEX idx_logs_created ON table_logs(created_at);
```

### Modificaciones a tablas existentes

```sql
ALTER TABLE orders ADD COLUMN table_session_id UUID REFERENCES table_sessions(id);
ALTER TABLE orders ADD COLUMN guest_id UUID REFERENCES table_guests(id);
ALTER TABLE orders ADD COLUMN round_number INTEGER DEFAULT 1;
CREATE INDEX idx_orders_session ON orders(table_session_id);

ALTER TABLE branches ADD COLUMN wifi_name TEXT;
ALTER TABLE branches ADD COLUMN wifi_password TEXT;
```

### Status por item (JSONB en orders.items)

```jsonc
{
  "product_id": "...",
  "product_name": "Hamburguesa",
  "price": 12000,
  "quantity": 2,
  "status": "confirmed",     // confirmed | preparing | ready
  "selected_options": [...],
  "selected_addons": [...],
  "notes": "sin cebolla"
}
```

---

## API Endpoints

### Admin (auth JWT)

| Método | Path | Descripción |
|--------|------|-------------|
| `POST` | `/table` | Crear mesa |
| `GET` | `/table` | Listar mesas del branch |
| `PUT` | `/table/:id` | Editar mesa |
| `DELETE` | `/table/:id` | Eliminar mesa |

### Cliente (público)

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/public/mesa/:tableId/session` | Obtener/crear sesión activa |
| `POST` | `/public/mesa/:tableId/join` | Unirse (token, nombre, alergias) |
| `POST` | `/public/mesa/session/:sid/confirm` | Confirmar ronda |
| `POST` | `/public/mesa/session/:sid/bill` | Pedir mi cuenta |
| `GET` | `/public/mesa/session/:sid/orders` | Pedidos de la sesión |

### Cocina (auth PIN/rol)

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/kitchen/:branchId/orders` | Pedidos activos (mesa + delivery) |
| `PATCH` | `/kitchen/order/:orderId/item` | Cambiar status de item |

### Mozo (auth JWT, rol staff)

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/staff/tables` | Mesas activas |
| `POST` | `/staff/table/:sid/guest` | Agregar persona virtual |
| `POST` | `/staff/table/:sid/order` | Pedido en nombre de guest |
| `PATCH` | `/staff/table/:sid/guest/:gid/payment` | Marcar pagado |
| `DELETE` | `/staff/table/:sid/guest/:gid` | Remover persona |
| `PATCH` | `/staff/table/:sid/close` | Cerrar mesa |

---

## Frontend

### Store: `tableSessionStore.ts`

```
Estado:
- guestToken, guestId, displayName
- session, guests, allOrders, myCart
- currentRound, readyGuests
- countdown: { endsAt } | null
- view: 'menu' | 'confirm' | 'bill'
```

### Hook: `useTableSocket`

Se conecta al montar, escucha eventos de `table:{session_id}`, actualiza el store, reconecta automáticamente, se desconecta al desmontar.

### Rutas nuevas

```
[slug]/mesa/[tableId]/     → cliente
[slug]/cocina/             → cocina
admin/mesas/               → admin + vista mozo
```

---

## Escalado: MVP → Producción

| Aspecto | MVP (1 servidor, 10 restaurantes) | Producción (N servidores) |
|---------|-----------------------------------|--------------------------|
| Socket.io | En memoria | Redis Adapter |
| Countdown | setTimeout + Map | BullMQ + Redis |
| Locks | Map + Promise | Redlock |
| Deploy | Oracle Cloud Free (ARM) | Múltiples instancias |
| Conexiones | ~170 pico | 100k+ |

Cada componente (CountdownManager, SessionLock, RoomsService) tiene una interfaz fija. Migrar es cambiar la implementación interna, no reescribir lógica.

---

## Testing

Cada edge case documentado en `qrs-mesa.md` debe tener un test automatizado. Los tests se dividen en dos tipos:

### Tests REST (Jest + supertest)

Cubren: CRUD de mesas, join a sesión, confirmar ronda, pedir cuenta, cambiar estado de items, marcar pagado, etc.

Se ejecutan con `pnpm --filter @clickpy/api test`.

### Tests de Socket (Jest + socket.io-client)

Cubren los edge cases de concurrencia y tiempo real:

| Escenario | Qué se testea |
|-----------|---------------|
| Mesa de 1 persona | Confirma → sale directo sin countdown |
| 3 personas, todas confirman | Ronda sale cuando la 3ra marca "listo" |
| Countdown se activa | 3 personas, 2 confirman → countdown empieza |
| Countdown expira | Carrito del pendiente se vacía, ronda sale sin él |
| Countdown se reinicia | Nuevo guest se une y agrega items → countdown reinicia |
| 2 confirman al mismo tiempo | Mutex evita doble confirmación de ronda |
| Countdown expira mientras alguien confirma | Lock serializa: uno gana, el otro falla limpio |
| Presencia | Guest se une → todos reciben `guest:joined` |
| Desconexión | Guest cierra browser → todos reciben `guest:left` |
| Reconexión | Guest vuelve con mismo token → re-entra a la sesión |
| Ronda 2 libre | Después de ronda 1, cualquiera confirma sin consenso |
| Cocina recibe pedido | Al confirmar ronda → `kitchen:new_order` llega al room de cocina |
| Cocina marca listo | `order:status_changed` llega al room de la mesa |
| Pedir cuenta | `bill:requested` llega a toda la mesa |
| Producto agotado | Confirmar con producto desactivado → error claro |

Estos tests levantan un servidor NestJS real, conectan múltiples clientes `socket.io-client` simulando personas en una mesa, y verifican que los eventos lleguen correctamente y en el orden esperado.

---

## Fases de Implementación

### Fase 1 — Base (sin real-time)

- [ ] DB: tablas nuevas + migraciones
- [ ] Shared: tipos Table, TableSession, TableGuest
- [ ] Backend: módulo `table` (CRUD)
- [ ] Backend: módulo `table-session` (join, confirmar)
- [ ] Frontend Admin: `/admin/mesas` + generación QR
- [ ] Frontend Cliente: `/[slug]/mesa/[tableId]` (polling)
- [ ] Tests REST para endpoints básicos

### Fase 2 — Real-time

- [ ] Backend: instalar Socket.io, módulo `realtime`
- [ ] Backend: gateway + auth adapter
- [ ] Backend: countdown manager
- [ ] Backend: session lock
- [ ] Frontend: `useTableSocket` + store
- [ ] Frontend: presencia + notificaciones + countdown
- [ ] Tests de socket para todos los edge cases

### Fase 3 — Cocina + Mozo

- [ ] Backend: módulo `kitchen`
- [ ] Backend: endpoints de mozo
- [ ] Frontend: `/[slug]/cocina`
- [ ] Frontend: vista mozo (mobile-first)
- [ ] Notificaciones: sonido + vibración

### Fase 4 — Cuenta y Propina

- [ ] Backend: lógica de cuenta individual + split
- [ ] Backend: propina (porcentajes configurables, desde 3%)
- [ ] Frontend: vista de cuenta + división + propina

### Fase 5 — Pulido + Deploy

- [ ] Sistema de logs (table_logs)
- [ ] Reconexión automática
- [ ] Soporte A6 descargable con WiFi
- [ ] Timeout de mesas (4h)
- [ ] Campo de alergias
- [ ] Deploy en Oracle Cloud (ARM + PM2 + Nginx)
