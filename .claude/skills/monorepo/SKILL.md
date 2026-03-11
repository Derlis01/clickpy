---
name: monorepo
description: Documentacion y guia del monorepo clickpy. Usar cuando se necesite entender la estructura, instalar paquetes, ejecutar comandos, trabajar con tipos compartidos, o resolver problemas del monorepo.
---

# Clickpy Monorepo

Monorepo con **pnpm workspaces + Turborepo** que contiene el frontend (Next.js) y el API (NestJS).

## Estructura

```
clickpy/
├── apps/
│   ├── web/           ← Next.js frontend (@clickpy/web)
│   └── api/           ← NestJS backend (@clickpy/api)
├── packages/
│   └── shared/        ← Tipos TypeScript compartidos (@clickpy/shared)
├── package.json       ← Root con scripts de turbo
├── pnpm-workspace.yaml
├── turbo.json
└── .npmrc
```

## Paquetes

| Paquete | Nombre | Descripcion |
|---------|--------|-------------|
| `apps/web` | `@clickpy/web` | Frontend Next.js 14 |
| `apps/api` | `@clickpy/api` | Backend NestJS 11 |
| `packages/shared` | `@clickpy/shared` | Interfaces TypeScript puras |

## Tipos compartidos (@clickpy/shared)

El paquete shared contiene **solo interfaces TypeScript** (sin runtime code, sin decoradores). Emite `.js` + `.d.ts` con `module: "NodeNext"`.

Tipos disponibles:

| Tipo | Archivo | Descripcion |
|------|---------|-------------|
| `Schedule`, `Hour` | `commerce.ts` | Horarios del comercio |
| `PaymentMethods`, `ShippingMethods` | `commerce.ts` | Metodos de pago y envio |
| `CheckoutConfiguration` | `commerce.ts` | Configuracion completa del checkout |
| `ProductOption`, `OptionValue` | `product.ts` | Opciones de producto |
| `ProductAddon` | `product.ts` | Addons de producto |
| `OrderProduct`, `Order` | `order.ts` | Productos y ordenes |
| `Customer` | `customer.ts` | Datos del cliente |
| `ApiResponse<T>` | `api.ts` | Respuesta generica de la API |

### Agregar un tipo nuevo a shared

1. Crear o editar el archivo en `packages/shared/src/`
2. Exportarlo en `packages/shared/src/index.ts` con `export type { NuevoTipo } from './archivo.js'` (extension `.js` obligatoria por NodeNext)
3. Correr `pnpm --filter @clickpy/shared build` para compilar

### Usar tipos compartidos en las apps

```typescript
import type { Order, Customer, ApiResponse } from '@clickpy/shared'
```

En `apps/web`, los archivos de tipos locales (`src/types/`) re-exportan desde `@clickpy/shared` para no romper imports existentes en componentes. Los tipos que son exclusivos del frontend (CommerceModel, AdminProduct, ProductCart, etc.) siguen definidos localmente.

## Comandos

### Instalar dependencias

```bash
# SIEMPRE desde la raiz del monorepo
pnpm install

# Agregar paquete a un proyecto especifico
pnpm add <paquete> --filter @clickpy/web
pnpm add <paquete> --filter @clickpy/api
pnpm add -D <paquete> --filter @clickpy/api   # devDependency

# Agregar herramienta global al root
pnpm add -D <paquete> -w
```

**Nunca** correr `pnpm install` o `npm install` dentro de `apps/web` o `apps/api` directamente.

### Build

```bash
# Build completo (shared -> web -> api, en orden por dependencias)
pnpm build

# Build de un solo proyecto
pnpm --filter @clickpy/web build
pnpm --filter @clickpy/api build
pnpm --filter @clickpy/shared build
```

Turborepo respeta el orden: siempre compila `@clickpy/shared` antes que las apps porque ambas dependen de el. Tambien cachea builds — si no cambiaste shared, no lo recompila.

### Dev

```bash
# Levantar todo (web + api simultaneo)
pnpm dev

# Solo uno
pnpm --filter @clickpy/web dev
pnpm --filter @clickpy/api dev
```

### Otros comandos

```bash
# Lint
pnpm lint

# Tests (solo API tiene tests configurados)
pnpm --filter @clickpy/api test

# Correr cualquier script de un proyecto
pnpm --filter @clickpy/api start:prod
```

## Variables de entorno

Cada app tiene sus propios archivos `.env`:
- `apps/web/.env.local` — variables de Next.js (NEXT_PUBLIC_*, etc.)
- `apps/api/.env` — variables de NestJS (DB, keys, etc.)

No van en la raiz. Estan en `.gitignore`.

## Configuracion clave

### pnpm-workspace.yaml
Define que carpetas son workspaces: `apps/*` y `packages/*`.

### turbo.json
Define las tasks y sus dependencias:
- `build`: depende de `^build` (primero los deps), outputs en `dist/**` y `.next/**`
- `dev`: persistent (no termina), sin cache
- `lint` y `test`: independientes

### next.config.mjs (web)
Tiene `transpilePackages: ['@clickpy/shared']` para que Next.js compile el paquete shared.

### tsconfig.json (shared)
Usa `composite: true` y `module: "NodeNext"` para emitir tipos correctamente para ambas apps.

## Troubleshooting

**"Cannot find module @clickpy/shared"**
→ Correr `pnpm --filter @clickpy/shared build` primero. El paquete necesita estar compilado.

**"Missing packageManager field"**
→ El root `package.json` debe tener `"packageManager": "pnpm@<version>"`.

**Tipos no se actualizan**
→ Rebuild shared: `pnpm --filter @clickpy/shared build`. En dev, usar `pnpm --filter @clickpy/shared dev` para watch mode.

**pnpm install falla con peer deps**
→ `.npmrc` tiene `auto-install-peers=true`, deberia resolverse automaticamente.

**Turbo no detecta cambios**
→ Borrar cache: `rm -rf .turbo` y volver a buildear.
