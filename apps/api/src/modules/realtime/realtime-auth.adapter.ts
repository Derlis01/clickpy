import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

/**
 * Custom Socket.io adapter that handles authentication in the handshake.
 *
 * Three auth types:
 * - Guest: session_token + session_id + display_name
 * - Kitchen: role=kitchen + branch_id + pin
 * - Staff: role=staff + branch_id + jwt
 *
 * Auth data is attached to socket.handshake.auth and read by the gateway.
 * For MVP, we trust the auth data. In production, validate JWTs and PINs here.
 */
export class RealtimeAuthAdapter extends IoAdapter {
  private readonly logger = new Logger(RealtimeAuthAdapter.name);

  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Middleware runs on every connection attempt
    server.use((socket: any, next: (err?: Error) => void) => {
      const auth = socket.handshake.auth;

      // Kitchen auth
      if (auth.role === 'kitchen') {
        if (!auth.branch_id || !auth.pin) {
          return next(new Error('Kitchen auth requires branch_id and pin'));
        }
        // TODO: validate PIN against branch config
        this.logger.debug(`Kitchen auth: branch=${auth.branch_id}`);
        return next();
      }

      // Staff auth
      if (auth.role === 'staff') {
        if (!auth.branch_id || !auth.jwt) {
          return next(new Error('Staff auth requires branch_id and jwt'));
        }
        // TODO: validate JWT with Supabase
        this.logger.debug(`Staff auth: branch=${auth.branch_id}`);
        return next();
      }

      // Guest auth (default)
      if (!auth.session_id || !auth.session_token) {
        return next(
          new Error('Guest auth requires session_id and session_token'),
        );
      }

      this.logger.debug(
        `Guest auth: session=${auth.session_id}, name=${auth.display_name}`,
      );
      return next();
    });

    return server;
  }
}
