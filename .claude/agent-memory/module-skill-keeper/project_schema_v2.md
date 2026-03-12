---
name: schema-v2-migration
description: El proyecto migro de schema v1 mono-comercio a schema v2 multi-org multi-sucursal. La tabla 'commerces' fue reemplazada por 'organizations' y el modelo de datos cambio significativamente.
type: project
---

En 2026-03-11 se completo un rediseno mayor del schema de base de datos.

Cambios principales:
- `commerces` → `organizations` (con nuevo campo `slug` globalmente unico, `currency`, `plan`)
- `profiles` ya no tiene `commerce_id`. Ahora la relacion es via `organization_members`
- Nuevo modelo multi-tenancy: organization_members (many-to-many users <-> orgs) con roles owner/admin/staff
- `branches` (sucursales) ahora son la unidad operativa: productos, categorias y pedidos pertenecen a branch
- `customers` pertenecen a la organizacion (no a la sucursal)
- Nuevo flujo de invitaciones via `organization_invitations`
- `price` en products cambiado de TEXT a NUMERIC(12,2)
- Trigger `handle_new_user` simplificado: solo crea `profiles`, la org se crea en WelcomeWizard
- Trigger `set_order_number` nuevo: numeros de orden secuenciales atomicos por sucursal via `branches.last_order_number`

El skill de auth (`/apps/web/src/app/auth/callback/route.ts`) tambien cambio: ahora consulta `organization_members` en lugar de `profiles.commerce_id`.

Migracion en: `apps/api/supabase/migrations/002_schema_v2_multi_org_branch.sql`
Skill de schema: `.claude/skills/database/schema.md`
