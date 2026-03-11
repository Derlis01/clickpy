# Backend Tickets

Tickets pendientes para el backend, derivados del refactor de auth del frontend.

---

## 1. Actualizar DB trigger de signup

El trigger actual crea commerce + profile con datos de `raw_user_meta_data` al registrarse un usuario. Ahora el user se crea via Google OAuth y el commerce se crea en el wizard post-signup.

**Opción A:** El trigger lee `raw_user_meta_data` que el frontend setea via `supabase.auth.updateUser({ data: {...} })` después del wizard.

**Opción B:** Se crea un endpoint dedicado (ver ticket #2).

---

## 2. Endpoint para crear commerce post-wizard

`POST /api/commerce/create`

Body:
```json
{
  "commerce_name": "string",
  "commerce_slug": "string",
  "commerce_category": "string",
  "commerce_phone": "string"
}
```

Debe:
- Crear el commerce en tabla `commerces`
- Actualizar `profiles.commerce_id` para el usuario autenticado
- Validar que el slug no esté en uso

---

## 3. Custom Access Token Hook

Inyectar `current_plan` y `commerce_id` en `app_metadata` del JWT para que el frontend los tenga sin queries extra a la DB.

Ref: https://supabase.com/docs/guides/auth/jwts#custom-access-token-hook

---

## 4. Modelo organizaciones (futuro)

- Crear tabla `organizations` (id, name, plan, created_at)
- Crear tabla `org_members` (user_id, org_id, role: owner/admin/member)
- Agregar `organization_id` a `commerces` (commerce = branch/sucursal)
- Migrar `current_plan` de `profiles` a `organizations`
- Endpoint para invitar users a una org
- Endpoint para listar/crear/switch branches

---

## 5. Verificar GET /commerce/get-commerce-info devuelve current_plan

Para el interim hasta que el Custom Access Token Hook esté configurado, el frontend necesita poder leer el `current_plan` del usuario. Verificar que el endpoint existente lo incluya en la respuesta o crear un endpoint dedicado.
