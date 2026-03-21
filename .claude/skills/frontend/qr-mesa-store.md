---
name: qr-mesa-store
description: Store Zustand del modulo QR Mesa frontend. Maneja estado de sesion, guests, carrito propio, items de otros guests, countdown y rondas. Usar cuando se trabaje con estado de mesa en el frontend.
---

# QR Mesa - Store (Frontend)

Archivo: `apps/web/src/store/tableSessionStore.ts`

## Proposito

Store Zustand (con devtools) que es la fuente de verdad del estado local de una sesion de mesa. Contiene la identidad del usuario, lista de guests, carrito propio, items de otros guests, estado de rondas y countdown.

## Tipos exportados

```typescript
GuestCartItem {
  product_name: string
  quantity: number
  price: number
}

GuestPresence {
  guest_id?: string
  display_name: string
  is_ready: boolean
  has_items: boolean
  is_connected: boolean
  items?: GuestCartItem[]   // items del guest para mostrar en MesaDrawer (read-only)
}

CartItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  notes?: string
}

CountdownState {
  active: boolean
  ends_at: string | null
}
```

## Estado del store

| Campo | Tipo | Descripcion |
|---|---|---|
| `sessionId` | string | null | ID de la sesion activa |
| `sessionToken` | string | null | Token del guest (UUID) |
| `displayName` | string | null | Nombre del usuario |
| `tableId` | string | null | ID de la mesa (para localStorage) |
| `tableNumber` | number | null | Numero de mesa visible al usuario |
| `guests` | GuestPresence[] | Todos los guests de la mesa |
| `cart` | CartItem[] | Carrito propio (no se usa directamente, el bridge usa publicCart) |
| `isReady` | boolean | Si el usuario confirmo su pedido |
| `countdown` | CountdownState | Estado del countdown de ronda |
| `currentRound` | number | Numero de ronda actual (empieza en 1) |
| `isConnected` | boolean | Conexion WebSocket activa |
| `lastRoundResult` | object | null | Resultado de la ultima ronda confirmada |

## Acciones clave

### addGuest(name, guestId?)

Previene duplicados: verifica por `guest_id` o `display_name` antes de agregar. Si ya existe, no hace nada.

### addGuestItem(guestName, item) / removeGuestItem(guestName, productName)

Actualiza `guest.items` dentro del array `guests`. Maneja `has_items` automaticamente. Se llaman desde el socket manager cuando llegan eventos `cart:item_added` / `cart:item_removed` de otros guests.

### setSession(sessionId, token, name, tableId, tableNumber?)

Persiste la sesion en localStorage con key `mesa_session_{tableId}`. Permite recuperar la sesion al recargar la pagina.

### clearCart()

Limpia `cart` y resetea `isReady` a false. Se llama al confirmar ronda.

### reset()

Limpia todo el estado. Se llama al salir de la mesa (handleLeave en MesaDrawer).

## Persistencia en localStorage

- Key: `mesa_session_{tableId}`
- Contenido: `{ sessionId, token, name }`
- Funciones helper exportadas: `getStoredSession(tableId)`, `storeSession(tableId, ...)`
- Al entrar a la pagina de mesa, se verifica si hay sesion almacenada para no pedir el nombre de nuevo

## Relaciones

- Depende de: nada (store base)
- Es usado por: `useTableSocket`, `MesaPage`, `MesaDrawer`, `CartResumeSticky`, `CommerceProducts`, `JoinForm`

## Notas para agentes

- `cart` en este store no es el carrito visual del usuario — ese esta en `usePublicCart`. El `cart` aqui existe para el protocolo de rondas pero no se usa activamente en la UI actual (el cart bridge lee de `publicCart`).
- Para agregar nuevos campos de estado de guest (ej: alergias), actualizar `GuestPresence` y la accion `addGuest`.
- `tableNumber` y `tableId` son distintos: `tableId` es el UUID de la mesa en DB, `tableNumber` es el numero para mostrar ("Mesa 5").

## Ultima actualizacion

2026-03-21 — Nuevo tipo `GuestCartItem`. Nuevas acciones `addGuestItem` y `removeGuestItem`. `addGuest` previene duplicados verificando por `guest_id` o `display_name`.
