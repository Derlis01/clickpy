import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter — atrapa TODOS los errores del sistema.
 *
 * - HttpException (400, 401, 404, etc.) → responde con el status y mensaje original
 * - Error desconocido → responde 500 con mensaje genérico (no expone internals)
 * - Loguea todo con contexto: path, method, user, body, stack trace
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, message, error } = this.extractError(exception);

    const errorResponse = {
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Loguear con contexto completo
    const logContext = {
      method: request.method,
      path: request.url,
      statusCode: status,
      userId: (request as any).user?.id,
      organizationId: (request as any).user?.organization_id,
      body: this.sanitizeBody(request.body),
      query: request.query,
      ip: request.ip,
    };

    if (status >= 500) {
      // Errores del servidor → log error con stack trace
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
        logContext,
      );
    } else if (status >= 400) {
      // Errores del cliente → log warn (sin stack trace, no es un bug)
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${message}`,
        logContext,
      );
    }

    response.status(status).json(errorResponse);
  }

  private extractError(exception: unknown): {
    status: number;
    message: string;
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          status,
          message: response,
          error: HttpStatus[status] || 'Error',
        };
      }

      const res = response as any;
      return {
        status,
        message: Array.isArray(res.message)
          ? res.message.join(', ')
          : res.message || exception.message,
        error: res.error || HttpStatus[status] || 'Error',
      };
    }

    // Error desconocido — no exponer detalles al cliente
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'image',
    ];
    const sanitized = { ...body };

    for (const key of Object.keys(sanitized)) {
      const val = sanitized[key];
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'string' && val.length > 200) {
        sanitized[key] = `[STRING:${val.length} chars]`;
      }
    }

    return sanitized;
  }
}
