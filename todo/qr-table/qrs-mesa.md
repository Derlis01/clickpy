# QRs Mesa — Exploración de Diseño

> **Estado**: 🟡 En definición
> **Última actualización**: 2026-03-12

---

## La Idea

Cada mesa tiene un QR. El cliente lo escanea, ve el menú, pide, y llega a cocina. Sin mozo tomando nota. Al final, cada uno paga lo suyo.

---

# PARTE 1 — Ya resuelto

Todo lo de abajo ya se discutió y se cerró. Queda como referencia para el desarrollo.

---

## Decisión 1 — Modelo de pedido

**Rondas con consenso en la primera, libre después.**

- Ronda 1: cada persona elige a su ritmo. Cuando todos marcan "Estoy listo", sale junto a cocina.
- Ronda 2+: libre. Cualquiera pide sin necesitar a los demás.
- Solo cuentan como participantes las personas con items en el carrito.

---

## Decisión 2 — Countdown automático

Cuando la mayoría ya confirmó y quedan pocos pendientes, el sistema activa un countdown de 3 minutos:

| Mesa de... | Se activa cuando faltan |
|------------|------------------------|
| 1 | Sin countdown, sale directo |
| 2 a 9 | 1 persona |
| 10 | 2 personas |
| 15 | 3 personas |
| 20+ | 20% del total |

La persona pendiente ve: *"Sandra y 2 más están listas. Enviando en 2:47..."*
Si no confirma → su carrito se vacía, puede pedir en la ronda siguiente.

Si alguien nuevo se une y agrega items durante el countdown → se reinicia.

---

## Decisión 3 — Onboarding

Nombre al escanear el QR, antes de entrar. Un campo, un botón. La UI del menú se explica sola después.

---

## Decisión 4 — Navegación del cliente

Dos vistas:
- **Menú** — explorar, agregar al carrito
- **Confirmar** — resumen de la mesa, quién confirmó, quién falta. Botón "Estoy listo".

---

## Decisión 5 — Edición de pedidos

- Antes de que la ronda salga a cocina → edición libre (incluso desmarcar "listo")
- Después → no se edita. Sin módulo de edición. Pedí en la ronda siguiente.

---

## Decisión 6 — Estados en cocina

Solo dos:
- **En cocina** — se está preparando
- **Listo** — cocina terminó, el mozo puede llevarlo

No hay estado "entregado". El mozo sabe qué llevó porque lo llevó él.

---

## Decisión 7 — Vista de cocina

Agrupado por mesa, ordenado por hora de llegada. Cada mesa es una tarjeta con items por ronda. Cocina marca "listo". Sin estaciones ni categorías.

---

## Decisión 8 — Pedir la cuenta

Individual, sin consenso. Cualquiera puede pedir **su** cuenta en cualquier momento. El mozo cobra. Queda como "pagado". Los demás siguen activos. Cuando todos pagaron → mesa se cierra automáticamente.

---

## Decisión 9 — División de cuenta (MVP)

Solo cálculo, sin integración de pago. Modos: "pago lo mío" (default), "partes iguales", "uno paga todo". El mozo cobra.

---

## Decisión 10 — El mozo como canal alternativo

El QR no es la única forma de pedir. El mozo puede desde su dispositivo:
- Agregar "personas virtuales" a la mesa
- Tomar pedidos en nombre de alguien
- Confirmar por ellos
- Llevar toda la mesa si nadie quiere usar el QR

Resuelve: personas sin celular, sin internet, o que prefieren el método tradicional.

---

## Decisión 11 — Soporte físico de mesa

En cada mesa: soporte con QR + WiFi + branding. El admin genera el diseño completo descargable desde el panel (no solo el QR).

Contiene: logo, QR, WiFi (nombre + contraseña), *"Escaneá para ver el menú y pedir"*, número de mesa.

---

## Decisión 12 — Adopción

No se fuerza. El mozo lo presenta como opción. El efecto contagio hace el resto. No: instrucciones largas, obligar, ni descuentos.

---

## Decisión 13 — Presencia colaborativa en el menú

Notificaciones esporádicas tipo *"Sandra agregó Pizza Margarita"* mientras navegás el menú. Refuerza la experiencia grupal y ayuda a coordinar ("ah, ella ya pidió pizza, yo pido otra cosa"). Estilo actividad en tiempo real, no invasivo.

---

## Decisión 14 — Vista del mozo

Vista dedicada, mobile-first, separada del admin. Acceso por rol de mozo (el admin crea el rol). Simple: mesas activas, items listos para llevar, gestión de pedidos por mesa.

Vista contextual: por default muestra lo que requiere acción ahora (items listos, cuentas pendientes). Se expande para ver historial completo. El mozo puede corregir pedidos y hacer pedidos desde su celular.

**Visión futura**: agente de voz donde el mozo habla al sistema y el sistema edita la mesa. Post-MVP.

---

## Decisión 15 — Propina

Sí, en el MVP. Al pedir la cuenta: *"¿Agradecer al mozo?"* con porcentajes redondeados que muestran el valor en moneda. Empezar en 3% (es LATAM, no es costumbre). Mínimo 5.000, con opción custom. Se suma al total de esa persona.

---

## Decisión 16 — Soporte físico: formato

Un solo formato estándar (tipo tarjeta A6), listo para imprimir. Sin múltiples plantillas en el MVP.

---

## Decisión 17 — WiFi en el sistema

El admin configura nombre de red + contraseña en la config de la sucursal. Se incluye automáticamente en todos los soportes de mesa generados.

---

## Decisión 18 — Timeout de mesa

Automático (4 horas sin actividad → se cierra sola) + cierre manual del admin en cualquier momento.

---

## Decisión 19 — Escaneo desde afuera / personas sospechosas

El admin o mozo puede ver quién está en la sesión y remover personas si es necesario.

---

## Decisión 20 — Notificaciones al mozo

Vibración + notificación in-app cuando cocina marca algo listo: *"Pedido para Mesa 3 listo"*. Nota técnica: la Vibration API funciona en Chrome/Android pero NO en iOS Safari. En iOS se usa solo notificación visual/sonora dentro de la app.

---

## Decisión 21 — Múltiples mozos

Todos los mozos ven todas las mesas. Sin asignación de zonas. Se coordinan verbalmente como siempre. Asignación de zonas queda para después si hace falta.

---

## Decisión 22 — Sistema de logs y analítica

Implementar desde el día 1 un sistema de logs que registre:
- Acciones del usuario (escaneo, agregar item, confirmar, pedir cuenta)
- Tiempos (cuánto tarda una mesa en confirmar Ronda 1, cuánto entre rondas)
- Abandonos (sesiones que se crean pero nunca confirman pedido)
- Errores y edge cases no contemplados

Esto permite: detectar fricciones reales con data, descubrir edge cases nuevos, y medir adopción del QR vs. mozo manual.

---

## Edge Cases resueltos

### Participantes

| Caso | Resolución |
|------|------------|
| Mesa de 1 persona | Sin consenso, sin countdown. Confirma y sale. |
| 3 escanean el mismo QR | Se unen a la misma sesión. Token en celular + nombre. |
| Llega alguien tarde (Ronda 1 ya fue) | Se une, ve historial. Su pedido es Ronda 2 (libre). |
| Llega alguien durante countdown | Si agrega items → countdown se reinicia. Si solo mira → no afecta. |
| Se va sin pagar | Se marca "no pagado". El mozo decide (cobra al grupo o absorbe). |
| Cierra navegador, vuelve mismo celular | Token en localStorage lo reconecta. Ve todo. |
| Entra desde otro dispositivo | Modal: "Esta mesa tiene sesión activa. ¿Unirte?" Entra como persona nueva. |
| No tiene celular | El mozo la agrega como persona virtual. |
| Nadie quiere usar QR | El mozo lleva toda la mesa desde su dispositivo. |

### Pedidos

| Caso | Resolución |
|------|------------|
| Countdown llega a 0 con items en carrito | Carrito se vacía. Mensaje: "Podés pedir en la próxima ronda." |
| Quiere editar algo ya en cocina | No se puede. Pide en la ronda siguiente. |
| Editar antes de que salga la ronda | Libre. Puede desmarcar "listo" y cambiar. |
| Pizza compartida | La pide una persona, queda en su cuenta. Mozo reasigna al dividir. |
| Producto se agota durante sesión | Desaparece del menú. En carrito → error claro al confirmar. |

### Cuenta

| Caso | Resolución |
|------|------------|
| 2 tocan "pedir mi cuenta" al mismo tiempo | Cada una ve su cuenta individual. Sin conflicto. |
| Cuenta con items aún en cocina | Se puede pedir. Total definitivo. |
| 2 se van, 2 se quedan | Las que se van piden su cuenta. Mesa sigue activa. |
| Pagó pero quiere pedir más | Puede. Nuevo pedido genera saldo adicional. |
| Se fue sin pagar | "No pagado". Mozo decide. |

### Cocina

| Caso | Resolución |
|------|------------|
| Pierde conexión | Al reconectar recibe todo lo pendiente. |
| Marca listo por error | Deshacer en 30 segundos. |
| 2 mesas llegan al mismo tiempo | FIFO. Cocina prioriza internamente. |

### Mozo

| Caso | Resolución |
|------|------------|
| Agrega item a mesa/persona equivocada | Corrige: quita y agrega donde corresponde. Si ya fue a cocina → corrige en la ronda siguiente. |
| Dos mozos gestionan la misma mesa | Ambos ven cambios en tiempo real. No hay bloqueo. En la práctica no se pisan. |
| Crea persona virtual y luego esa persona escanea | Entra como nueva. El mozo puede fusionar ambas o dejarlas separadas. |
| Celular del mozo sin batería | Todo en el servidor. Otro mozo o admin sigue gestionando. |
| Remueve a alguien por error | Pedidos ya en cocina NO se borran. Solo se desvincula de la sesión. Puede re-agregarla. |
| Mozo = cocinero (restaurante chico) | Usa ambas vistas desde el mismo celular. Alterna entre las dos. |
| Nota en pedido ("sin sal") | Agrega notas por item, igual que el cliente. |

### Operación del restaurante

| Caso | Resolución |
|------|------------|
| Cambio de mesa (el restaurante mueve al grupo a otra mesa) | El mozo "transfiere" la sesión a otra mesa desde su vista. Todos los pedidos, personas y estado se mueven. Los clientes ven un aviso: "Tu mesa cambió a Mesa 7". El QR viejo queda libre para una nueva sesión. |
| Se cae el WiFi del restaurante | El mozo toma pedidos a la antigua (papel/memoria) y los carga después cuando vuelva la conexión. Los pedidos que ya estaban en cocina no se pierden (están en el servidor). Los clientes ven "Sin conexión — tu mozo puede ayudarte". |
| Delivery y mesas llegan a cocina al mismo tiempo | Cocina ve ambos canales en la misma vista, diferenciados: las tarjetas de mesa dicen "Mesa 3" y las de delivery dicen "Delivery #142". El restaurante decide internamente cómo priorizar. El sistema no prioriza un canal sobre otro. |
| Alergias / restricciones alimentarias | El cliente puede marcar restricciones al ingresar su nombre (campo opcional: "Alergias o restricciones"). Aparece como alerta visible en cocina junto al item. El mozo también puede agregarlo. No es solo una nota — es un campo destacado con ícono de alerta. |
| El menú cambia (almuerzo → cena) | Los items que ya están en carritos confirmados no se afectan (precio congelado al confirmar). Los items en carritos sin confirmar que ya no existen en el nuevo menú se marcan como "no disponible" con opción de quitarlos. El nuevo menú se carga automáticamente al refrescar. |
| Reserva con menú prefijado | Post-MVP. En el MVP, las mesas no tienen menú especial — todos ven el mismo menú. |

## Decisión 23 — Cambio de mesa

Sin transferencia de sesión. Se cierra la sesión vieja y los clientes escanean el nuevo QR. Simple, sin complejidad extra. Los pedidos ya enviados a cocina siguen asociados a la mesa vieja en el historial.

---

## Decisión 24 — Alergias y restricciones

Campo dedicado en algún punto del flujo (onboarding o antes de confirmar) con opciones predefinidas (celíaco, vegano, alergia a maní, etc.) + campo libre. Aparece como alerta visible en cocina junto a los items de esa persona.

---

## Decisión 25 — Delivery + mesas en cocina

Vista unificada. Delivery y mesas juntos, diferenciados con indicador visual claro ("Mesa 3" vs "Delivery #142"). Cocina no necesita cambiar entre tabs.

---

# ESTADO: Diseño funcional completo

Todas las preguntas fueron respondidas. 25 decisiones tomadas, ~35 edge cases resueltos.

## Próximos pasos

1. Definir wireframes/mockups de las vistas principales
2. Escribir el plan técnico en `qrs-mesa-tecnico.md`
