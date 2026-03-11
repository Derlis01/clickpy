# Sistema de Autenticacion - ClickPy

Documentacion completa del flujo de autenticacion entre el frontend (Next.js + Supabase Auth) y el backend (NestJS + JWT).

## Flujo General

```
Google OAuth → Supabase Auth → Cookie Session → JWT en headers → NestJS Guard
```

## Frontend (Next.js)

### Supabase Clients

| Archivo | Tipo | Uso |
|---------|------|-----|
| `apps/web/src/utils/supabase/client.ts` | Browser client | Componentes client-side (`'use client'`) |
| `apps/web/src/utils/supabase/server.ts` | Server client | RSC, API routes, Server Actions |
| `apps/web/src/utils/supabase/middleware.ts` | Middleware client | Refresh de sesion en cada request |

### Hooks

**`useSupabaseAuth`** (`apps/web/src/hooks/useSupabaseAuth.ts`)
- `signInWithGoogle()` — inicia OAuth, redirige a `/auth/callback`
- `signOut()` — cierra sesion

**`useAuth`** (`apps/web/src/hooks/authHook.ts`)
- Verifica si el usuario tiene `commerce_id` en la tabla `profiles`
- Si no tiene comercio, redirige a `/welcome`

### Flujo de Login

1. Usuario va a `/login` → click en "Continuar con Google"
2. `signInWithGoogle()` redirige a Google OAuth con `redirectTo: /auth/callback`
3. Google devuelve codigo → Supabase lo intercambia por sesion
4. `/auth/callback` (`apps/web/src/app/auth/callback/route.ts`):
   - Intercambia code por session con `exchangeCodeForSession(code)`
   - Consulta tabla `profiles` para ver si tiene `commerce_id`
   - Si tiene comercio → redirige a `/admin`
   - Si NO tiene comercio → redirige a `/welcome`
   - Si hay error → redirige a `/login?error=auth_failed`

### Middleware de Auth

**Archivo**: `apps/web/src/middleware.ts` + `apps/web/src/utils/supabase/middleware.ts`

**Reglas de redireccion**:
- No autenticado + accede a `/admin/*` o `/welcome` → redirige a `/login`
- Autenticado + accede a `/login` → redirige a `/admin`
- Refresca la sesion de Supabase en cada request (cookies)

### Onboarding (WelcomeWizard)

**Archivo**: `apps/web/src/app/welcome/components/WelcomeWizard.tsx`

Formulario de 3 pasos para usuarios nuevos:
1. Nombre del comercio + slug auto-generado
2. Categoria del comercio
3. Numero de WhatsApp

Al completar, llama a `supabase.auth.updateUser()` con metadata:
```typescript
{ commerce_name, commerce_slug, commerce_category, commerce_phone }
```

### Paginas de Auth

| Ruta | Archivo | Descripcion |
|------|---------|-------------|
| `/login` | `apps/web/src/app/login/page.tsx` | Boton de Google OAuth |
| `/welcome` | `apps/web/src/app/welcome/page.tsx` | Onboarding wizard |
| `/auth/callback` | `apps/web/src/app/auth/callback/route.ts` | Callback de OAuth |

## Backend (NestJS)

### Configuracion de Supabase

**Archivo**: `apps/api/src/common/config/supabase.config.ts`

Variables de entorno:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (service role, bypasea RLS)
- `SUPABASE_JWT_SECRET`

### SupabaseAuthGuard (Global)

**Archivo**: `apps/api/src/common/guards/supabase-auth.guard.ts`

Registrado globalmente en `app.module.ts` via `APP_GUARD`. Flujo:

1. Verifica si la ruta tiene `@Public()` → si la tiene, permite acceso sin token
2. Extrae JWT del header `Authorization: Bearer <token>`
3. Valida el token con `supabase.auth.getUser(token)`
4. Busca el perfil en tabla `profiles` para obtener `commerce_id` y `current_plan`
5. Adjunta el usuario al request como `AuthenticatedUser`

**NOTA**: Actualmente esta en **modo testing** — retorna un usuario hardcodeado. El codigo de produccion esta comentado.

### Decoradores

**`@Public()`** (`apps/api/src/common/decorators/public.decorator.ts`)
- Marca rutas como publicas (sin JWT)
- Usa `SetMetadata` con key `IS_PUBLIC_KEY`

**`@CurrentUser()`** (`apps/api/src/common/decorators/current-user.decorator.ts`)
- Extrae el `AuthenticatedUser` del request
- Uso: `@CurrentUser() user: AuthenticatedUser`

### Tipos

**Archivo**: `apps/api/src/common/types/authenticated-request.ts`

```typescript
export class AuthenticatedUser {
  id: string;           // UUID del usuario en auth.users
  commerceId: string;   // UUID del comercio asociado
  currentPlan: PlanName; // 'free' | 'entrepreneur' | 'business' | 'enterprise'
}
```

### Rutas Publicas vs Protegidas

**Protegidas** (requieren JWT):
- `GET /api/commerce/get-commerce-info`
- `PUT /api/commerce/put-commerce-info`
- `PUT /api/commerce/update-checkout-configuration`
- `POST /api/product/addProduct`
- `GET /api/product/getProducts`
- Todas las rutas de producto sin prefijo `public/`

**Publicas** (marcadas con `@Public()`):
- `GET /api/public/commerce/get-commerce-info/:slug`
- `GET /api/public/commerce/get-commerce-products`
- `GET /api/public/product/commerce-products/:commerceId`
- `GET /api/public/product/:commerceSlug/:productId`
- `POST /api/public/post-customer-order`

## Base de Datos

### Trigger `on_auth_user_created`

**Archivo**: `apps/api/supabase/migrations/001_initial_schema.sql` (linea 176)

Cuando un usuario se registra en Supabase Auth:
1. Lee `raw_user_meta_data` del nuevo usuario
2. Crea un registro en `commerces` con los datos del metadata
3. Crea un registro en `profiles` vinculado al comercio y con plan `'free'`

### Tablas involucradas

- `auth.users` — manejada por Supabase Auth
- `profiles` — vincula usuario con comercio y plan
- `commerces` — datos del comercio

### Bug conocido: Registro falla para usuarios nuevos

El trigger `handle_new_user` crea un comercio con `commerce_slug` vacio (`''`) cuando el usuario se registra por primera vez via Google OAuth (porque el metadata aun no tiene los datos del WelcomeWizard). La columna `commerce_slug` tiene constraint `UNIQUE NOT NULL`, asi que:
- El primer usuario funciona (slug `''` es unico)
- El segundo usuario falla: `Database error saving new user` porque `''` ya existe

**Solucion propuesta**: Separar la creacion del comercio del trigger. El trigger solo deberia crear el `profile` sin `commerce_id`. El comercio se crea despues desde el WelcomeWizard via la API.

## Variables de Entorno

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Backend (`apps/api/.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWT_SECRET=...
```

## Ejemplo de uso en un controller

```typescript
// Ruta protegida — el guard valida JWT automaticamente
@Get('commerce/get-commerce-info')
async getCommerceInfo(@CurrentUser() user: AuthenticatedUser) {
  return this.commerceService.getCommerceInfo(user.commerceId);
}

// Ruta publica — sin auth
@Public()
@Get('public/commerce/get-commerce-info/:slug')
async getCommerceInfoPublic(@Param('slug') slug: string) {
  return this.commerceService.getCommerceBySlug(slug);
}
```
