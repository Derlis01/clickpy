# ClickPy API

Backend REST API para **ClickPy**, una plataforma que permite a comercios crear su tienda online y recibir pedidos de clientes sin fricción.

## Qué hace el proyecto

Cada comercio registrado obtiene un storefront público accesible por slug (ej. `clickpy.app/mi-negocio`). El dueño gestiona sus productos, configuración de checkout y horarios desde un panel. Los clientes finales navegan el catálogo y realizan pedidos sin necesidad de cuenta.

## Stack

- **Runtime:** Node.js con NestJS (TypeScript)
- **Base de datos:** PostgreSQL en Supabase
- **Auth:** Supabase Auth (JWT Bearer tokens)
- **Storage:** Cloudflare R2 (imágenes de productos y logos)

## Arquitectura

```
src/
├── app.module.ts           # Módulo raíz
├── main.ts                 # Bootstrap (puerto, CORS, validación global)
│
├── common/
│   ├── config/             # supabase.config.ts, cloudflare.config.ts, plans.config.ts
│   ├── guards/             # SupabaseAuthGuard (global, verifica JWT y adjunta user)
│   ├── decorators/         # @Public() para bypass de auth, @CurrentUser() para extraer user
│   └── types/              # AuthenticatedRequest (request + user tipado)
│
└── modules/
    ├── commerce/           # Info del comercio, checkout config, horarios
    ├── product/            # CRUD de productos, visibilidad, categorías
    ├── order/              # Creación de pedidos (ruta pública)
    ├── customer/           # Repositorio de clientes (upsert por teléfono)
    └── upload/             # Upload de imágenes a Cloudflare R2
```

Cada módulo sigue el patrón: `controller → service → repository`. El repository es el único que habla con Supabase directamente.

## Autenticación

El `SupabaseAuthGuard` está aplicado **globalmente**. Verifica el JWT con Supabase Auth, luego busca el perfil del usuario en la tabla `profiles` para obtener `commerce_id` y `current_plan`, y los adjunta al request.

Las rutas bajo `/api/public/` están marcadas con `@Public()` y no requieren token — son para el storefront del cliente final.

## Base de datos (Supabase)

Tablas: `commerces`, `profiles`, `products`, `customers`, `orders`.

- RLS habilitado en todas las tablas. El backend usa la **secret key** que bypasea RLS.
- Trigger `on_auth_user_created`: al registrarse un usuario, crea automáticamente su comercio y perfil.
- Trigger `update_products_count`: mantiene el contador de productos en `commerces` sincronizado.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default 3000) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Secret key de Supabase (reemplaza la legacy service_role key) |
| `CLOUDFLARE_ENDPOINT` | Endpoint del bucket R2 |
| `CLOUDFLARE_PUBLIC_BUCKET_URL` | URL pública de las imágenes |
| `CLOUDFLARE_BUCKET_NAME` | Nombre del bucket |
| `CLOUDFLARE_R2_KEY` | Access key de R2 |
| `CLOUDFLARE_R2_SECRET` | Secret key de R2 |

## Planes

Definidos en `plans.config.ts`. Controlan límites como cantidad máxima de productos por comercio según el plan (`free`, `entrepreneur`, `business`, `enterprise`).

## Documentación de endpoints

Ver `ENDPOINTS.md` para la lista completa con ejemplos de request/response.
