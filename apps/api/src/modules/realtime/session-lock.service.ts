import { Injectable } from '@nestjs/common';

/**
 * In-memory mutex per session. Serializes concurrent operations
 * (e.g., two guests confirming at the same time, or countdown expiring
 * while someone is confirming).
 *
 * MVP: single server, Map-based. Migration: Redlock with Redis.
 */
@Injectable()
export class SessionLockService {
  private locks = new Map<string, Promise<void>>();

  async acquire(sessionId: string): Promise<() => void> {
    // Wait for any existing lock on this session
    const existing = this.locks.get(sessionId);
    let release: () => void;

    const newLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.locks.set(
      sessionId,
      (existing ?? Promise.resolve()).then(() => newLock),
    );

    // Wait for our turn
    if (existing) await existing;

    return release!;
  }
}
