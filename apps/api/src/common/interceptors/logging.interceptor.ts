import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { randomUUID } from 'crypto';

/**
 * Global logging interceptor — loguea cada request/response con timing.
 *
 * Agrega:
 * - Correlation ID (X-Request-Id) para rastrear requests
 * - Tiempo de respuesta en ms
 * - Contexto del usuario autenticado
 *
 * No loguea rutas de health check para evitar ruido.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Correlation ID — si el cliente no lo envía, lo generamos
    const requestId =
      (request.headers['x-request-id'] as string) || randomUUID();
    response.setHeader('X-Request-Id', requestId);

    // No loguear health checks
    if (request.url === '/api/health') {
      return next.handle();
    }

    const { method, url } = request;
    const userId = (request as any).user?.id;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const status = response.statusCode;

          this.logger.log(
            `${method} ${url} → ${status} (${ms}ms)` +
              (userId ? ` [user:${userId}]` : '') +
              ` [req:${requestId.slice(0, 8)}]`,
          );
        },
        error: () => {
          // El error se loguea en AllExceptionsFilter, no aquí
          // Solo registramos el timing
          const ms = Date.now() - start;
          this.logger.debug(
            `${method} ${url} → ERROR (${ms}ms) [req:${requestId.slice(0, 8)}]`,
          );
        },
      }),
    );
  }
}
