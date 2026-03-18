/**
 * Helpers para tests de Socket.io — QR Mesa
 *
 * Utilidades para crear servidores de test NestJS con Socket.io
 * y conectar múltiples clientes simulando personas en una mesa.
 */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../src/app.module';
import { RealtimeAuthAdapter } from '../../src/modules/realtime/realtime-auth.adapter';

/**
 * Crea una app NestJS de test con Socket.io habilitado.
 * Retorna la app y el puerto donde escucha.
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  port: number;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useWebSocketAdapter(new RealtimeAuthAdapter(app));
  await app.init();
  await app.listen(0); // puerto random
  const url = await app.getUrl();
  const port = parseInt(new URL(url).port);
  return { app, port };
}

/** Conecta un cliente Socket.io simulando un guest en una mesa. */
export function connectGuest(
  port: number,
  sessionId: string,
  opts?: { token?: string; name?: string },
): Socket {
  const token = opts?.token ?? `guest_${Math.random().toString(36).slice(2)}`;
  return io(`http://localhost:${port}`, {
    transports: ['websocket'],
    auth: {
      session_token: token,
      session_id: sessionId,
      display_name: opts?.name ?? 'Test Guest',
    },
    autoConnect: true,
    forceNew: true,
  });
}

/** Conecta un cliente Socket.io simulando la vista de cocina. */
export function connectKitchen(
  port: number,
  branchId: string,
  pin: string,
): Socket {
  return io(`http://localhost:${port}`, {
    transports: ['websocket'],
    auth: {
      role: 'kitchen',
      branch_id: branchId,
      pin,
    },
    autoConnect: true,
    forceNew: true,
  });
}

/** Espera a que un socket reciba un evento. Timeout configurable. */
export function waitForEvent<T = any>(
  socket: Socket,
  event: string,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout esperando evento '${event}' (${timeoutMs}ms)`));
    }, timeoutMs);

    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

/** Espera a que un socket se conecte (transport level). */
export function waitForConnect(
  socket: Socket,
  timeoutMs = 5000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) return resolve();
    const timer = setTimeout(
      () => reject(new Error(`Timeout conectando (${timeoutMs}ms)`)),
      timeoutMs,
    );
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Espera a que un guest esté completamente registrado en el server.
 * Resuelve cuando llega `guest:presence`, que se emite al final de handleConnection.
 * Para kitchen/staff, usa waitForConnect directamente.
 */
export function waitForGuestReady(
  socket: Socket,
  timeoutMs = 10000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(new Error(`Timeout esperando guest:presence (${timeoutMs}ms)`)),
      timeoutMs,
    );
    socket.once('guest:presence', (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
    socket.once('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/** Desconecta múltiples sockets. */
export function disconnectAll(...sockets: Socket[]): void {
  for (const s of sockets) {
    if (s?.connected) s.disconnect();
  }
}

/** Espera N milisegundos. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Conecta un mozo (staff) por Socket.io.
 * El mozo usa JWT de Supabase con rol staff.
 */
export function connectFloor(
  port: number,
  branchId: string,
  jwt: string,
): Socket {
  return io(`http://localhost:${port}`, {
    transports: ['websocket'],
    auth: {
      role: 'staff',
      branch_id: branchId,
      jwt,
    },
    autoConnect: true,
    forceNew: true,
  });
}

/**
 * Hace una llamada REST al API de test (para acciones del mozo, admin, etc.).
 * Usa fetch nativo (Node 18+).
 */
export async function apiCall(
  port: number,
  method: string,
  path: string,
  body?: any,
  token?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`http://localhost:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
