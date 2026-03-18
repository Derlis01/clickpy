/**
 * Test básico — Smoke test del módulo QR Mesa
 *
 * Verifica que el servidor levanta, los sockets se conectan,
 * y los flujos fundamentales funcionan antes de correr la suite completa.
 */
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import {
  createTestApp,
  connectGuest,
  connectKitchen,
  connectFloor,
  waitForEvent,
  waitForConnect,
  waitForGuestReady,
  disconnectAll,
  sleep,
} from './helpers';

describe('QR Mesa — Smoke Test', () => {
  let app: INestApplication;
  let port: number;

  beforeAll(async () => {
    ({ app, port } = await createTestApp());
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  // ── 1. El servidor levanta ──

  it('el servidor levanta y escucha en un puerto', () => {
    expect(port).toBeGreaterThan(0);
  });

  // ── 2. Conexiones socket ──

  describe('Conexiones', () => {
    let guest: Socket;
    let kitchen: Socket;
    let floor: Socket;

    afterEach(() => {
      disconnectAll(guest, kitchen, floor);
    });

    it('un guest se conecta por socket', async () => {
      guest = connectGuest(port, 'smoke-session-1', { name: 'Sandra' });
      await waitForGuestReady(guest);
      expect(guest.connected).toBe(true);
    });

    it('cocina se conecta por socket', async () => {
      kitchen = connectKitchen(port, 'smoke-branch-1', '1234');
      await waitForConnect(kitchen);
      expect(kitchen.connected).toBe(true);
    });

    it('mozo se conecta por socket', async () => {
      floor = connectFloor(port, 'smoke-branch-1', 'staff-jwt');
      await waitForConnect(floor);
      expect(floor.connected).toBe(true);
    });
  });

  // ── 3. Presencia básica ──

  describe('Presencia', () => {
    let guest1: Socket;
    let guest2: Socket;

    afterEach(() => {
      disconnectAll(guest1, guest2);
    });

    it('al conectarse recibe guest:presence', async () => {
      guest1 = connectGuest(port, 'smoke-session-2', { name: 'Sandra' });
      const presence = await waitForGuestReady(guest1);
      expect(presence).toHaveProperty('guests');
      expect(Array.isArray(presence.guests)).toBe(true);
    });

    it('segundo guest genera guest:joined para el primero', async () => {
      guest1 = connectGuest(port, 'smoke-session-3', { name: 'Sandra' });
      await waitForGuestReady(guest1);

      const joinedPromise = waitForEvent(guest1, 'guest:joined');
      guest2 = connectGuest(port, 'smoke-session-3', { name: 'Carlos' });
      await waitForGuestReady(guest2);

      const joined = await joinedPromise;
      expect(joined).toHaveProperty('display_name', 'Carlos');
    });
  });

  // ── 4. Carrito básico ──

  describe('Carrito', () => {
    let guest1: Socket;
    let guest2: Socket;

    afterEach(() => {
      disconnectAll(guest1, guest2);
    });

    it('agregar item notifica al otro guest', async () => {
      guest1 = connectGuest(port, 'smoke-session-4', { name: 'Sandra' });
      guest2 = connectGuest(port, 'smoke-session-4', { name: 'Carlos' });
      await Promise.all([waitForGuestReady(guest1), waitForGuestReady(guest2)]);

      const addedPromise = waitForEvent(guest2, 'cart:item_added');
      guest1.emit('cart:update', {
        action: 'add',
        product_id: 'pizza-001',
        product_name: 'Pizza',
        quantity: 1,
        price: 45000,
      });

      const event = await addedPromise;
      expect(event).toMatchObject({
        guest_name: 'Sandra',
        product_name: 'Pizza',
      });
    });
  });

  // ── 5. Ronda simple (1 persona) ──

  describe('Ronda simple', () => {
    let guest: Socket;
    let kitchen: Socket;

    afterEach(() => {
      disconnectAll(guest, kitchen);
    });

    it('mesa de 1: agrega item, confirma, ronda sale directo', async () => {
      guest = connectGuest(port, 'smoke-session-5', { name: 'Sandra' });
      kitchen = connectKitchen(port, 'unknown', '1234');
      await Promise.all([waitForGuestReady(guest), waitForConnect(kitchen)]);

      guest.emit('cart:update', {
        action: 'add',
        product_id: 'pizza-001',
        product_name: 'Pizza',
        quantity: 1,
        price: 45000,
      });

      await sleep(100);

      const confirmedPromise = waitForEvent(guest, 'round:confirmed');
      guest.emit('round:ready');

      const confirmed = await confirmedPromise;
      expect(confirmed).toHaveProperty('round', 1);
    });
  });

  // ── 6. Ronda consenso (2 personas) ──

  describe('Ronda consenso', () => {
    let guests: Socket[];

    afterEach(() => {
      disconnectAll(...guests);
    });

    it('2 personas: ronda sale cuando ambos confirman', async () => {
      guests = [
        connectGuest(port, 'smoke-session-6', { name: 'Sandra' }),
        connectGuest(port, 'smoke-session-6', { name: 'Carlos' }),
      ];
      await Promise.all(guests.map((g) => waitForGuestReady(g)));

      // Ambos agregan items
      for (const g of guests) {
        g.emit('cart:update', {
          action: 'add',
          product_id: 'pizza-001',
          product_name: 'Pizza',
          quantity: 1,
          price: 45000,
        });
      }
      await sleep(100);

      // Sandra confirma → countdown starts (2 personas, 1 pending = threshold)
      const countdownPromise = waitForEvent(guests[1], 'countdown:started');
      guests[0].emit('round:ready');
      const countdownEvent = await countdownPromise;
      expect(countdownEvent).toHaveProperty('ends_at');

      // Carlos confirma → todos listos → ronda sale
      const confirmedPromise = waitForEvent(guests[0], 'round:confirmed');
      guests[1].emit('round:ready');

      const confirmed = await confirmedPromise;
      expect(confirmed).toHaveProperty('round', 1);
      expect(confirmed).toHaveProperty('items');
    }, 15000);

    it('confirmar sin items → error', async () => {
      guests = [connectGuest(port, 'smoke-session-7', { name: 'Sandra' })];
      await waitForGuestReady(guests[0]);

      const errorPromise = waitForEvent(guests[0], 'round:error');
      guests[0].emit('round:ready');

      const error = await errorPromise;
      expect(error).toHaveProperty('code', 'EMPTY_CART');
    });
  });
});
