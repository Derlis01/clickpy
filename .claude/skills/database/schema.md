---
name: database-schema
description: Esquema de base de datos v2 multi-org multi-sucursal de ClickPy en Supabase. Usar cuando se necesite entender tablas, relaciones, RLS, triggers, o flujos de datos.
---

# Esquema de Base de Datos - ClickPy v2

## Proposito

Modelo de datos multi-organizacion y multi-sucursal sobre Supabase (PostgreSQL). Cada organizacion puede tener multiples miembros y multiples sucursales. Cada sucursal gestiona sus propios productos, categorias y pedidos. Los clientes pertenecen a la organizacion, no a la sucursal.

Archivo de migracion: `apps/api/supabase/migrations/002_schema_v2_multi_org_branch.sql`

## Diagrama de Relaciones

```
auth.users
    |
    v (trigger: handle_new_user)
profiles
    |
    v (many-to-many)
organization_members ---> organizations <--- organization_invitations
                              |
                              v
                          branches (sucursales)
                              |
                    +---------+---------+
                    v                   v
          product_categories         orders
                    |                   |
                    v                   v
                products            customers (pertenece a org, no a branch)
```

## Tablas

### organizations (antes: commerces)

Entidad raiz. Una cuenta puede pertenecer a varias organizaciones.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| name | TEXT | Nombre visible |
| slug | TEXT UNIQUE | URL-friendly, unico en toda la plataforma |
| phone | TEXT | |
| logo | TEXT | URL |
| banner | TEXT | URL |
| primary_color | TEXT | |
| category | TEXT | |
| currency | TEXT | DEFAULT 'PYG' |
| plan | TEXT | free / entrepreneur / business / enterprise |
| created_at, updated_at | TIMESTAMPTZ | |

### profiles

Un perfil por usuario de Supabase Auth. Creado automaticamente por trigger al registrarse.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | → auth.users ON DELETE CASCADE |
| full_name | TEXT | Copiado de Google metadata |
| avatar_url | TEXT | Copiado de Google metadata |
| created_at, updated_at | TIMESTAMPTZ | |

### organization_members

Tabla puente usuarios <-> organizaciones. Define el rol dentro de la org.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| organization_id | UUID | → organizations |
| profile_id | UUID | → profiles |
| role | TEXT | owner / admin / staff |
| created_at | TIMESTAMPTZ | |

Constraint: UNIQUE(organization_id, profile_id) — un usuario no puede tener dos roles en la misma org.

### organization_invitations

Invitaciones pendientes para unirse a una organizacion. Soporta usuarios nuevos y existentes.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| organization_id | UUID | → organizations |
| email | TEXT | Email del invitado |
| role | TEXT | admin / staff |
| status | TEXT | pending / accepted / expired |
| token | UUID | Para validar el link de invitacion |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### branches (sucursales)

Cada organizacion puede tener multiples sucursales. Una debe ser `is_main = true`.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| organization_id | UUID | → organizations |
| name | TEXT | |
| slug | TEXT nullable | UNIQUE(organization_id, slug) |
| address | TEXT | |
| phone | TEXT | |
| is_main | BOOLEAN | DEFAULT false. La sucursal principal de la org |
| last_order_number | INTEGER | DEFAULT 0. Usado para numeros de orden secuenciales atomicos |
| schedule | JSONB | DEFAULT '[]'. Ver estructura abajo |
| payment_methods | JSONB | {cash, qr, transfer, paymentLink}: {enabled: bool} |
| shipping_methods | JSONB | {pickup, dinein}: {enabled}, {delivery}: {enabled, fee} |
| ask_payment_method | BOOLEAN | Si mostrar selector de metodo de pago al cliente |
| is_active | BOOLEAN | |
| is_deleted | BOOLEAN | Soft delete |
| created_at, updated_at | TIMESTAMPTZ | |

Estructura de `schedule`:
```json
[
  { "day": 0, "is_open": true, "hours": [{ "open": "09:00", "close": "18:00" }] }
]
```
`day`: 0=domingo, 1=lunes, ..., 6=sabado.

### product_categories

Categorias de productos por sucursal.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| branch_id | UUID | → branches |
| name | TEXT | |
| sort_order | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

### products

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| branch_id | UUID | → branches |
| category_id | UUID nullable | → product_categories ON DELETE SET NULL |
| name | TEXT | |
| description | TEXT | |
| price | NUMERIC(12,2) | NO es TEXT. Precision monetaria |
| cover_image | TEXT | Imagen principal para listados |
| images | JSONB | DEFAULT '[]'. Array de todas las imagenes |
| is_deleted | BOOLEAN | Soft delete |
| is_active | BOOLEAN | |
| is_hidden | BOOLEAN | Oculto sin eliminar |
| sort_order | INTEGER | |
| options | JSONB | Ver estructura abajo |
| addons | JSONB | Ver estructura abajo |
| has_addon_limits | BOOLEAN | |
| min_addons | INTEGER | |
| max_addons | INTEGER | |
| created_at, updated_at | TIMESTAMPTZ | |

Estructura de `options`:
```json
[{
  "optionId": "uuid",
  "name": "Tamano",
  "required": true,
  "values": [{ "optionValueId": "uuid", "name": "Grande", "price_modifier": 5000 }]
}]
```

Estructura de `addons`:
```json
[{ "addonId": "uuid", "name": "Extra queso", "description": "", "price": 3000 }]
```

### customers

Clientes de una organizacion (no de una sucursal especifica). Identificados por telefono.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| organization_id | UUID | → organizations |
| phone | TEXT | |
| name | TEXT | |
| email | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

Constraint: UNIQUE(organization_id, phone)

### orders (pedidos)

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| branch_id | UUID | → branches |
| order_number | INTEGER | Auto-asignado por trigger, secuencial por sucursal |
| customer_id | UUID nullable | → customers |
| customer_phone | TEXT | Snapshot desnormalizado |
| customer_name | TEXT | Snapshot desnormalizado |
| items | JSONB | Ver estructura abajo |
| subtotal | NUMERIC(12,2) | |
| delivery_fee | NUMERIC(12,2) | |
| total | NUMERIC(12,2) | |
| currency | TEXT | |
| status | TEXT | pending / confirmed / preparing / ready / delivered / cancelled |
| type | TEXT | delivery / pickup / dinein |
| payment_method | TEXT | |
| payment_status | TEXT | pending / paid |
| notes | TEXT | |
| cancellation_reason | TEXT | |
| delivery_address | JSONB nullable | {street, city, notes, lat, lng} |
| table_number | TEXT nullable | Para pedidos dinein |
| estimated_time | INTEGER nullable | Minutos |
| created_at, updated_at | TIMESTAMPTZ | |

Estructura de `items`:
```json
[{
  "product_id": "uuid",
  "product_name": "Hamburguesa",
  "price": 35000,
  "quantity": 2,
  "selected_options": [],
  "selected_addons": [],
  "notes": "",
  "subtotal": 70000
}]
```

Los datos del cliente (phone, name) se desnormalizan en el pedido como snapshot inmutable al momento de la compra.

## Indexes

- `idx_branches_organization_id` — branches por org
- `idx_product_categories_branch_id` — categorias por sucursal
- `idx_products_branch_id` — productos por sucursal
- `idx_products_active` — productos activos (para listados publicos)
- `idx_customers_organization_id` — clientes por org
- `idx_orders_branch_id` — pedidos por sucursal
- `UNIQUE idx_orders_branch_number (branch_id, order_number)` — garantiza unicidad del numero de orden por sucursal

## Triggers

### update_updated_at()

BEFORE UPDATE en todas las tablas. Actualiza automaticamente `updated_at`. Incluye `SET search_path = public` para evitar ataques de path injection en funciones SECURITY DEFINER.

### handle_new_user()

AFTER INSERT ON auth.users. Solo crea el registro en `profiles` con `full_name` y `avatar_url` del metadata de Google. **No crea la organizacion.** La organizacion se crea despues desde el WelcomeWizard.

Declarado con `SECURITY DEFINER SET search_path = public` — esto es el fix al gotcha clasico de Supabase donde SECURITY DEFINER sin search_path fijo puede ser explotado.

### set_order_number()

BEFORE INSERT ON orders. Incrementa atomicamente `branches.last_order_number` y lo asigna a `orders.order_number`. Garantiza numeros de orden secuenciales y sin gaps por concurrencia dentro de cada sucursal.

## Row Level Security (RLS)

| Tabla | Politica |
|-------|----------|
| profiles | SELECT/UPDATE solo para el propio usuario (auth.uid() = id) |
| organizations | SELECT publico, INSERT autenticado, UPDATE solo miembros |
| organization_members | INSERT solo para el propio perfil, SELECT del propio perfil |
| branches | SELECT publico (is_active + NOT is_deleted), INSERT para miembros |
| product_categories | SELECT publico (is_active = true) |
| products | SELECT publico (is_active, NOT is_deleted, NOT is_hidden) |
| orders | INSERT publico (cualquiera puede crear un pedido) |
| customers | INSERT publico |

## Flujos Clave

### Registro y Onboarding

1. Usuario hace login con Google OAuth
2. Supabase crea `auth.users`
3. Trigger `handle_new_user` crea `profiles` (solo nombre y avatar)
4. Auth callback (`apps/web/src/app/auth/callback/route.ts`) busca en `organization_members` por `profile_id`
5. Sin membresia → redirige a `/welcome`
6. WelcomeWizard crea: `organizations` + `organization_members` (role: owner) + `branches` (is_main: true)
7. Con membresia → redirige a `/admin`

### Invitaciones

1. Owner crea registro en `organization_invitations`
2. Llama a `supabase.auth.admin.inviteUserByEmail` con metadata `{ invitation_id }`
3. Usuario nuevo: trigger crea `profiles`, auth callback detecta `invitation_id` en metadata y procesa la invitacion pendiente
4. Usuario existente: auth callback busca invitaciones pendientes por email

### Creacion de Pedidos

1. Cliente en el storefront publico crea pedido via `POST /api/public/order`
2. Trigger `set_order_number` asigna el proximo numero secuencial de la sucursal
3. Si el cliente es nuevo, se crea en `customers` (upsert por organization_id + phone)
4. El pedido guarda snapshot de datos del cliente (no FK unicamente)

## Auth Guard (NestJS)

Archivo: `apps/api/src/common/guards/supabase-auth.guard.ts`

El guard protegido:
1. Verifica JWT Bearer token con Supabase
2. Consulta `organization_members JOIN organizations` para obtener `plan` y `role`
3. Consulta `branches WHERE is_main = true` para obtener la sucursal principal
4. Inyecta en el request: `AuthenticatedUser { id, organizationId, branchId, plan, role }`

## Endpoints API

### Protegidos (Bearer JWT requerido)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET/PUT | /api/organization | Info de la organizacion |
| GET | /api/branch | Listado de sucursales |
| GET/PUT | /api/branch/:id | Detalle y actualizacion de sucursal |
| GET/POST/PUT/DELETE | /api/product | CRUD de productos |
| PUT | /api/product/visibility | Visibilidad masiva de productos |

### Publicos (sin auth)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/public/org/:slug | Info de la org (storefront) |
| GET | /api/public/org/:slug/branches | Sucursales de la org |
| GET | /api/public/product/:orgSlug | Productos activos (sucursal principal) |
| POST | /api/public/order | Crear pedido de cliente |

## Decisiones Tecnicas

- **price como NUMERIC(12,2) no TEXT**: La v1 usaba TEXT para precio, lo que impedia calculos en BD. Corregido en v2.
- **customers a nivel org, no branch**: Un cliente puede pedir en cualquier sucursal de la misma org. El historial queda unificado.
- **last_order_number en branches**: Alternativa a secuencias de PostgreSQL por branch, permite atomicidad con un simple UPDATE ... RETURNING sin necesidad de gestionar secuencias separadas.
- **Datos de cliente desnormalizados en orders**: El snapshot en `customer_phone`/`customer_name` garantiza que los pedidos historicos no se vean afectados si el cliente actualiza sus datos.
- **Trigger separado de la org**: En v1 el trigger creaba la org al registrarse, causando un bug con UNIQUE en commerce_slug para el segundo usuario. En v2 el trigger solo crea `profiles`; la org se crea via WelcomeWizard.
- **SECURITY DEFINER SET search_path = public**: Fix explicito al gotcha de Supabase con funciones SECURITY DEFINER que podrian ser explotadas si no se fija el search_path.

## Relaciones con Otros Modulos

- Depende de: Supabase Auth (auth.users)
- Es usado por: modulo-auth (flujo de login/registro), modulo-organizaciones, modulo-sucursales, modulo-productos, modulo-ventas, modulo-usuarios

## Notas para Agentes

- Al agregar una tabla nueva, siempre agregar trigger de `update_updated_at`, habilitar RLS, y crear politicas explicitas.
- El `order_number` es asignado por trigger, nunca pasarlo en el INSERT de orders.
- Para obtener el `organizationId` de un usuario autenticado en el backend, usar `AuthenticatedUser` del guard, no hacer una query adicional.
- El slug de organizacion es globalmente unico. El slug de sucursal es unico por organizacion.
- `is_deleted = true` en branches/products es soft delete; los endpoints publicos filtran por `is_deleted = false`.
- La sucursal principal (`is_main = true`) es la que usan los endpoints publicos de productos por defecto.

## Ultima actualizacion

2026-03-11 — Documentacion inicial del schema v2. Migracion desde modelo mono-comercio (commerces + profiles con commerce_id) a modelo multi-org multi-sucursal (organizations + organization_members + branches).
