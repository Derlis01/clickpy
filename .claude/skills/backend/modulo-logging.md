---
name: backend-logging
description: Sistema de logging y manejo de errores global del backend NestJS. Usar cuando se necesite entender cómo se loguean requests, cómo se manejan excepciones, o cómo agregar logging a un módulo nuevo.
---

# Logging y Manejo de Errores - Backend

## Arquitectura

Tres capas que actúan en orden sobre cada request:

```
Request
  └── LoggingInterceptor       ← timing, correlation ID, log de éxito
        └── [handler]
              └── AllExceptionsFilter  ← atrapa errores, loguea con contexto, responde 4xx/5xx

Pino (driver)  ← Logger subyacente para todo NestJS
PM2 logrotate  ← rotación de archivos en producción
```

## Archivos Clave

- `apps/api/src/common/filters/all-exceptions.filter.ts` — Captura toda excepción. Diferencia 4xx (warn) de 5xx (error + stack trace). Sanitiza body.
- `apps/api/src/common/interceptors/logging.interceptor.ts` — Loguea cada request/response con timing y correlation ID. Skippea `/api/health`.
- `apps/api/src/app.module.ts` — Registra `LoggerModule` (Pino), `AllExceptionsFilter` y `LoggingInterceptor` globalmente via `APP_FILTER` y `APP_INTERCEPTOR`.
- `apps/api/src/main.ts` — `app.useLogger(app.get(PinoLogger))` reemplaza el logger interno de NestJS.
- `scripts/setup-pm2-logrotate.sh` — Script de un solo uso para configurar `pm2-logrotate` en el servidor.

## Decisiones Técnicas

- **Pino sobre Winston**: 10x más rápido, menos RAM. Crítico en servidor con 1GB.
- **nestjs-pino**: integración oficial, `app.useLogger()` sin cambios en módulos.
- **autoLogging: false**: `LoggingInterceptor` controla el formato, no pinoHttp.
- **pino-pretty solo en dev**: producción emite JSON puro que PM2 captura.
- **Correlation ID (X-Request-Id)**: generado si el cliente no lo envía. Se devuelve en response.
- **Body sanitization**: `password`, `token`, `secret`, `authorization`, `image` → `[REDACTED]`. Strings >200 chars → `[STRING:N chars]`.

## Cómo Agregar Logging a un Módulo

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MiService {
  private readonly logger = new Logger(MiService.name);

  async miMetodo() {
    this.logger.log('Operación exitosa');
    this.logger.warn('Algo sospechoso');
    this.logger.error('Falló', error.stack);
  }
}
```

Nunca usar `console.log` — siempre `Logger` de NestJS.

## Formato de Error Response

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Product not found",
  "path": "/api/product/abc",
  "timestamp": "2026-03-17T00:00:00.000Z"
}
```

Errores 5xx siempre responden `"Internal server error"` — nunca exponen detalles internos.

## Log Rotation en Producción

PM2 logrotate (configurado con `scripts/setup-pm2-logrotate.sh`):
- Rotación diaria a las 00:00
- Max 10MB por archivo
- 7 archivos (≈7 días TTL)
- Compresión automática
- Total en disco: ~70MB máximo

## Notas

- No duplicar logs de error en servicios — el filtro global ya captura todo.
- Para rutas que no logueen, editar el `if` en `LoggingInterceptor.intercept()`.
- En tests: `app.useLogger(false)` silencia el logger.
- `setup-pm2-logrotate.sh` se ejecuta **una sola vez** en el servidor.
