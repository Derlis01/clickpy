# Backend Contract

Lo que el backend espera del frontend. Sin opinión sobre cómo implementarlo.

---

## Autenticación

El backend valida el token de **Supabase Auth** directamente. No tiene endpoints propios de auth (`/auth/loginUser`, `/auth/registerNewUser`, `/auth/refreshToken`, etc.) — eso es responsabilidad total del frontend.

**En cada request a rutas protegidas**, el backend espera:

```
Authorization: Bearer <supabase-session-token>
```

El token tiene que ser el JWT de sesión que emite Supabase Auth. El backend lo valida llamando a `supabase.auth.getUser(token)` y luego busca el perfil del usuario en la tabla `profiles` para resolver el `commerce_id` y el `current_plan` del usuario.

El backend **no refresca tokens**, **no emite tokens**, **no guarda sesiones**. Solo recibe el header y valida.

---

## Rutas públicas

Las rutas bajo `/api/public/*` no requieren header de autorización. Son de acceso libre.

```
GET  /api/public/commerce/get-commerce-info/:slug
GET  /api/public/commerce/get-commerce-products?slug=
GET  /api/public/product/commerce-products/:commerceId
GET  /api/public/product/:commerceSlug/:productId
POST /api/public/post-customer-order
```

---

## Registro de usuario

Al registrarse un usuario en Supabase Auth, un trigger en la base de datos crea automáticamente su comercio y su perfil. El frontend debe pasar los siguientes metadatos al momento del signup:

```json
{
  "commerce_name": "string",
  "commerce_slug": "string",
  "commerce_category": "string",
  "commerce_phone": "string"
}
```

Estos van en `raw_user_meta_data` al crear el usuario en Supabase Auth.

---

## Endpoints disponibles

Ver `ENDPOINTS.md` en el repositorio del backend para la lista completa con body y respuestas esperadas.
