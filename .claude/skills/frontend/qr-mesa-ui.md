---
name: qr-mesa-ui
description: Componentes de UI del modulo QR Mesa en el frontend. MesaPage, MesaStorefront, JoinForm, MesaDrawer, CartResumeSticky (mesa mode), y CommerceProducts (isMesaMode). Usar cuando se modifiquen pantallas o componentes visuales de mesa.
---

# QR Mesa - UI (Frontend)

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `apps/web/src/app/[slug]/mesa/[tableId]/page.tsx` | Pagina principal, init de sesion, orquestacion |
| `apps/web/src/app/[slug]/mesa/[tableId]/components/JoinForm.tsx` | Formulario para ingresar nombre |
| `apps/web/src/app/[slug]/mesa/[tableId]/components/MesaDrawer.tsx` | Drawer/Modal con pedido de la mesa |
| `apps/web/src/app/[slug]/components/CommerceProducts.tsx` | Catalogo de productos (compartido con storefront normal) |
| `apps/web/src/app/[slug]/components/CartResumeSticky.tsx` | Sticky inferior del carrito (compartido) |

---

## MesaPage (`page.tsx`)

### Flujo de init

```
1. Verifica localStorage para sesion guardada (getStoredSession)
2. En paralelo: fetch table info + fetch org primary_color
3. Si hay sesion → muestra MesaStorefront
4. Si no hay sesion → muestra JoinForm
```

### MesaStorefront (subcomponente interno)

Componente separado para poder llamar `useTableSocket()` solo cuando `sessionId` ya esta en el store (el hook requiere sessionId activo). Simplificado: solo llama el hook y renderiza `<CommerceProducts isMesaMode />`.

### Fetch de datos

- `GET /api/public/mesa/{tableId}/session` — numero de mesa y sesion activa
- `GET /api/public/org/{slug}` — datos del comercio incluyendo `primary_color`
- `GET /api/public/org/{slug}/branches` — sucursales para armar `Commerce` completo
- Los dos primeros se hacen en paralelo en el init. Los ultimos dos se hacen en paralelo cuando hay sesion.

### handleJoin(name)

1. Fetch sesion activa para obtener `session.id`
2. Genera token con `crypto.randomUUID()`
3. POST `/api/public/mesa/{tableId}/join`
4. Llama `setSession()` en el store

---

## JoinForm

Unico campo: nombre. Boton "Continuar". Acepta `primaryColor` para usar el color del restaurante en el boton en vez del azul default.

---

## MesaDrawer

Renderiza como `Drawer` (lateral derecho) en desktop y como `Modal full` en mobile. Usa `useWindowSize()` para detectar breakpoint.

### Contenido

- **Header**: "Mi pedido" + pills de guests (solo si hay >1 persona en la mesa)
- **Guests pills**: muestra "Vos" para el usuario actual, nombre para los demas. Color diferenciado (primary vs gray).
- **Mis items**: `ProductCartCard` por cada producto del carrito propio
- **Items de otros guests**: `GuestItems` (read-only) por cada guest conectado con items
- **Footer**: total propio, boton "Confirmar pedido" / "Cancelar", boton "Salir de la mesa"

### GuestItems (subcomponente interno)

Lista read-only de items de otro guest. Muestra `{qty}x {nombre} — Gs. {precio}`. Solo visible si el guest tiene items.

### Acciones

- `handleReady()` → emit `round:ready`, setReady(true)
- `handleUnready()` → emit `round:unready`, setReady(false)
- `handleLeave()` → limpia localStorage, clearProducts, reset store, cierra drawer

### Colores

El boton "Confirmar pedido" usa `commerceData.commercePrimaryColor` via inline style.

---

## CommerceProducts con `isMesaMode`

Prop booleana que cuando es `true`:
- Oculta: redes sociales (Instagram, Facebook), modal de horarios, nombre del comercio, direccion, divider
- Muestra: `MesaHeader` (subcomponente interno)
- Quita el `rounded-t-2xl mt-[-13px] border` del contenedor (no hay banner arriba)

### MesaHeader (subcomponente interno)

```
Mesa {tableNumber}
Hola, {displayName}
```

Lee directamente de `useTableSessionStore`. Minimal: solo centrado, sin iconos.

---

## CartResumeSticky en mesa mode

Cuando `mesaSessionId` existe (isMesaMode):
- Visible siempre (aunque el carrito este vacio)
- Texto: "Mi pedido" (en vez de "Ver mi pedido")
- Al tocar → abre `MesaDrawer` (no el checkout normal)
- Color de fondo: `commerceData.commercePrimaryColor` (no azul hardcodeado)

### Animacion flying product

Al agregar un producto al carrito, una imagen del producto "vuela" desde el centro de la pantalla hacia el sticky con una trayectoria en arco. Implementado con Framer Motion.

```
FlyingProduct:
  - Parte del centro de la pantalla (window.height * 0.5)
  - Vuela hacia las coords del sticky (BoundingClientRect)
  - Curva via keyframes [0, 0.4, 1] con curveOffsetY = -60
  - Escala de 1 → 0.3, opacity 1 → 0
  - Duracion: 600ms
```

Al llegar (550ms), dispara `bumpSticky()` — animacion CSS de rebote fisico con amortiguacion (6 keyframes, 650ms).

---

## Relaciones entre componentes

```
MesaPage
  └── JoinForm (si no hay sesion)
  └── MesaStorefront
        └── useTableSocket() — conecta socket + cart bridge
        └── CommerceProducts (isMesaMode=true)
              └── MesaHeader
              └── ProductSection

CartResumeSticky (siempre montado en layout)
  └── MesaDrawer (si isMesaMode)
  └── CartResumeForm (si !isMesaMode)
```

## Relaciones con otros modulos

- Depende de: `tableSessionStore`, `useTableSocket`, `publicCart`, `publicCommerce`
- Es usado por: layout del slug (CartResumeSticky siempre montado)

## Notas para agentes

- `CartResumeSticky` esta montado en el layout general (`[slug]/layout`), no solo en mesa. La deteccion de modo mesa es via `!!mesaSessionId`.
- Para agregar nuevas acciones en el drawer (ej: pedir cuenta), agregar un boton en el footer y emitir el evento correspondiente via `emit()`.
- Los colores del restaurante deben pasarse siempre como inline style (no clases de Tailwind) porque son dinamicos.
- La prop `isMesaMode` en `CommerceProducts` oculta info del negocio porque en mesa el usuario ya sabe donde esta; la experiencia es de catalogo puro.

## Ultima actualizacion

2026-03-21 — Creado skill. MesaStorefront simplificado (solo useTableSocket + CommerceProducts). JoinForm simplificado a un campo. MesaDrawer reescrito sin "Ronda X", con GuestItems read-only y pills de guests. CartResumeSticky con flying product animation, bump fisico, y color primario del restaurante. CommerceProducts recibe isMesaMode y muestra MesaHeader minimal.
