# Bitacora de Infraestructura — ClickPy

> Registro de decisiones, contexto y razonamiento detrás de cada elección de infra.
> Fecha de inicio: 2026-03-17

---

## Contexto general

ClickPy es un sistema de gestión para restaurantes. Estamos en fase de **validación de mercado**: ofrecer el sistema gratis a restaurantes para ver si realmente les soluciona, antes de monetizar. El objetivo es validar con **hasta 10 restaurantes** sin gastar plata en infra.

---

## Decisión 1 — Base de datos: Supabase Cloud (Free Tier)

**Elegido**: Supabase Cloud, plan gratuito.

**Qué nos da gratis**:
- PostgreSQL hosteado (500 MB)
- Auth (JWT, roles, 50,000 MAU)
- 5 GB egress/mes
- Región: São Paulo

**Por qué no self-hosted**: Supabase self-hosted levanta 13 contenedores Docker y necesita mínimo 4 GB RAM. Nuestro servidor tiene 1 GB. Además ya usamos Auth y RLS de Supabase en el backend — migrar a self-hosted no aporta nada y complica todo.

**Por qué alcanza para 10 restaurantes**: 10 restaurantes con sus menús, pedidos y sesiones usan ~50 MB de los 500 MB disponibles. ~100 usuarios staff de los 50,000 MAU. No vamos a tocar ni el 30% de los límites.

**Riesgo**: los proyectos free se pausan después de 1 semana sin actividad. Con la API haciendo queries constantemente, no debería pasar.

**Proyecto**: región São Paulo (misma que el servidor, latencia ~2ms entre ellos).

---

## Decisión 2 — Servidor backend: Oracle Cloud Always Free

**Elegido**: Oracle Cloud Infrastructure, VM.Standard.E2.1.Micro (Always Free).

**Specs**: 2 vCPUs AMD EPYC, 1 GB RAM, 47 GB disco, São Paulo.

**Costo**: $0 para siempre. Tag `free-tier-retained: true` confirmado.

**Por qué Oracle y no Hetzner**: tenemos un Hetzner CX23 (4 GB RAM, Nuremberg, €3.49/mes) pero está en Alemania. El ping desde Paraguay a Alemania es ~210ms. Con WebSocket para countdown en tiempo real, presencia de usuarios y notificaciones, eso se siente. Oracle São Paulo da ~40ms. Para el MVP con Socket.io, la latencia importa más que la RAM extra.

**Por qué 1 GB alcanza**: NestJS + PM2 + Nginx consumen ~150 MB. Socket.io con 450 conexiones simultáneas (10 restaurantes × 15 mesas × 3 personas) agrega ~10 MB. Nos quedan ~700 MB libres.

**Plan de upgrade**: hay un cron intentando crear una VM ARM A1 (4 cores, 24 GB RAM, también Always Free) cada 5 minutos. La demanda es alta y no siempre hay capacidad. Si se crea, migramos ahí y apagamos la Micro.

**Descartado Docker**: en 1 GB RAM el overhead de Docker (~200-300 MB) no es justificable. Vamos directo con Node.js + PM2.

---

## Decisión 3 — Stack de deploy: Node.js + PM2 + Caddy

**Elegido**: Node.js 22 LTS (vía nvm), PM2 como process manager, Caddy como reverse proxy.

**Consumo estimado**:
- Caddy: ~15 MB
- PM2: ~10 MB
- NestJS (Node.js): ~80-120 MB
- Total: ~150 MB de 1 GB

**Por qué PM2**: restart automático si crashea, logs rotativos, monitoreo de CPU/RAM, deploy con git pull + build + restart. Maduro y probado en producción.

**Por qué Caddy y no Nginx**: SSL automático con Let's Encrypt (cero config), soporte nativo de WebSocket sin configuración adicional, config mínima (3 líneas). Nginx requiere configurar manualmente certificados, headers de WebSocket upgrade y renovación de certs.

**Por qué no Docker**: el overhead de Docker Engine + contenedor en 1 GB RAM es significativo (~200-300 MB). No ganamos nada que PM2 no resuelva, y perdemos RAM que necesitamos.

**Por qué no Bun**: NestJS con Bun es experimental. No vale el riesgo para producción.

**Estructura en el servidor**:
```
~/app/                    # Repo clonado (git pull para deploy)
~/ecosystem.config.js     # Config PM2 (fuera del repo, no se sobreescribe)
~/.env.clickpy            # Secrets (chmod 600, fuera del repo)
/etc/caddy/Caddyfile      # Reverse proxy: api.clickpy.app → localhost:3000
```

**Deploy**: `./scripts/deploy-api.sh` — un solo comando que hace SSH, git pull, install, build, restart PM2.

**Monorepo + PM2**: pnpm con `public-hoist-pattern` en `.npmrc` para que PM2 encuentre las dependencias (express, @nestjs/*, etc.) desde la raíz del monorepo. Las variables de entorno se cargan con `node --env-file` apuntando a `~/.env.clickpy`.

---

## Decisión 4 — DNS y SSL: Cloudflare

**Elegido**: Cloudflare (ya tenemos el dominio clickpy.app ahí).

**Plan**: apuntar `api.clickpy.app` → IP del servidor Oracle (registro A, proxy activado).

**SSL**: doble capa — Caddy obtiene certificado Let's Encrypt automáticamente, y Cloudflare proxy agrega su propia capa SSL. Full encryption end-to-end.

---

## Decisión 5 — Real-time: Socket.io (no Supabase Realtime)

**Elegido**: Socket.io + NestJS WebSocket Gateway.

**Por qué no Supabase Realtime**: Supabase Realtime solo puede reaccionar a cambios en la DB. Nosotros necesitamos lógica server-side al recibir eventos (evaluar countdown, validar concurrencia, serializar confirmaciones). Con Supabase Realtime habría que escribir en DB solo para triggear eventos — es un hack.

**Por qué Socket.io**: rooms por mesa, reconexión automática (clave para WiFi de restaurante), NestJS tiene soporte nativo con `@WebSocketGateway`. Maduro, documentado, probado.

---

## Decisión 6 — Hetzner como backup / staging

**Conservamos**: Hetzner CX23 (178.104.30.31, 4 GB RAM, Nuremberg, €3.49/mes).

**Uso actual**: disponible como entorno de staging o CI si lo necesitamos. No es producción por la latencia (210ms desde Paraguay).

**Si Oracle falla**: Hetzner es el fallback inmediato. Más RAM, mismo stack. La latencia es aceptable para testing, no ideal para producción con WebSocket.

---

## Resumen de costos

| Servicio | Costo | Para qué |
|----------|-------|----------|
| Oracle Cloud VM | $0/mes | Backend (NestJS + Socket.io) |
| Supabase Cloud | $0/mes | PostgreSQL + Auth |
| Cloudflare | $0/mes | DNS + SSL + proxy |
| Hetzner CX23 | €3.49/mes | Backup / staging (opcional) |
| **Total** | **€0 - €3.49/mes** | |

---

## Línea de tiempo

| Fecha | Evento |
|-------|--------|
| 2026-03-17 | Cuenta Oracle Cloud creada. VM Micro (1 GB) levantada en São Paulo. |
| 2026-03-17 | Cron activo para intentar crear VM ARM A1 (4 cores, 24 GB) cada 5 min. |
| 2026-03-17 | Decisión: Supabase Cloud free, no self-hosted. |
| 2026-03-17 | Decisión: Node.js + PM2 + Nginx, sin Docker. |
| 2026-03-17 | DNS api.clickpy.app configurado en Cloudflare (registro A, proxy activado). |
| 2026-03-17 | Caddy instalado como reverse proxy con SSL automático. |
| 2026-03-17 | Node.js 22 LTS + pnpm + PM2 instalados en el servidor. |
| 2026-03-17 | Primer deploy exitoso del backend. API respondiendo en https://api.clickpy.app |
| 2026-03-17 | Deploy key SSH configurado en GitHub para acceso al repo privado. |
| Pendiente | Si VM ARM se crea, migrar y apagar Micro. |
