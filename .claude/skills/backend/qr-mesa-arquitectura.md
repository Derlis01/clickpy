---
name: qr-mesa-arquitectura
description: Arquitectura general del modulo QR Mesa. Vision global, flujo del usuario, modulos involucrados, y principio REST+Socket. Usar como punto de entrada para entender QR Mesa.
---

# QR Mesa - Arquitectura General

## Que es

Sistema de pedidos en mesa para restaurantes. Los clientes escanean un QR, eligen productos en tiempo real con los demas de la mesa, confirman juntos, y el pedido llega a cocina.

## Flujo del usuario

```
Escanea QR → Ingresa nombre → Ve el menu → Agrega items al carrito
→ Todos confirman (consenso) → Pedido va a cocina → Puede pedir mas (ronda 2+)
→ Pide la cuenta → Paga → Sesion se cierra
```

## Principio arquitectonico

**REST para acciones puntuales, Socket.io para tiempo real.**

- REST: crear sesion, unirse, pedir cuenta, marcar pago, acciones de staff
- Socket: carritos en vivo, confirmaciones, notificaciones, presencia

## Los 3 modulos

| Modulo | Directorio | Responsabilidad |
|---|---|---|
| `TableModule` | `src/modules/table/` | CRUD de mesas fisicas (admin) |
| `TableSessionModule` | `src/modules/table-session/` | Logica de negocio: sesiones, guests, pedidos, pagos |
| `RealtimeModule` | `src/modules/realtime/` | Socket.io: eventos en tiempo real, carritos en memoria |

## Patron por modulo

```
Controller  →  "que hacer" (recibe HTTP/Socket, devuelve respuesta)
Service     →  "como hacerlo" (logica de negocio, validaciones)
Repository  →  "donde guardarlo" (queries a Supabase PostgreSQL)
```

## Los 3 roles de usuario

| Rol | Conexion | Room Socket |
|---|---|---|
| Guest (cliente) | Socket + REST publico | `table:{session_id}` |
| Kitchen (cocina) | Socket | `kitchen:{branch_id}` |
| Staff/Floor (mozo) | REST + Socket | `floor:{branch_id}` |

## Diagrama de capas

```
Frontend (celular/tablet)
    |
    |--- Socket.io ----→  RealtimeGateway
    |--- HTTP REST ----→  TableSessionController / TableController
                              |
                         Services (logica)
                              |
                         Repositories (Supabase SQL)
                              |
                         PostgreSQL (Supabase)
```

## Estado en memoria vs base de datos

- **Memoria** (`SessionStateManager`): carritos, estado ready, ronda actual. Es la fuente de verdad para el estado "vivo".
- **Base de datos**: sesiones, guests, ordenes confirmadas, pagos. Se actualiza en momentos clave (ronda confirmada, cuenta pedida, pago).

## Decorador @Public()

Las rutas bajo `/api/public/` usan `@Public()` para bypass del `SupabaseAuthGuard`. Son las que usa el cliente desde el celular (no tiene JWT).

## Dependencia circular

`TableSessionModule` necesita `RealtimeBroadcaster` (de RealtimeModule) y `RealtimeModule` necesita `TableSessionService` (de TableSessionModule). Se resuelve con `forwardRef()` en ambos modulos.
