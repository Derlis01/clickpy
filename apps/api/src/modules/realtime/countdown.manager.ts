import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ActiveCountdown {
  timeout: NodeJS.Timeout;
  endsAt: Date;
}

/**
 * Manages countdown timers per session.
 *
 * Countdown rules (from qrs-mesa.md Decision 2):
 * - Mesa de 1: no countdown, sale directo
 * - 2 a 9 personas: se activa cuando falta 1
 * - 10 personas: cuando faltan 2
 * - 15 personas: cuando faltan 3
 * - 20+ personas: cuando falta el 20%
 *
 * MVP: setTimeout + Map in memory.
 * Migration: BullMQ with Redis.
 */
@Injectable()
export class CountdownManager {
  private readonly logger = new Logger(CountdownManager.name);
  private countdowns = new Map<string, ActiveCountdown>();
  private durationMs: number;

  constructor(private configService: ConfigService) {
    const seconds = this.configService.get<number>('COUNTDOWN_SECONDS') ?? 180;
    this.durationMs = seconds * 1000;
  }

  /** Calculate how many pending guests trigger a countdown */
  getPendingThreshold(totalParticipants: number): number {
    if (totalParticipants <= 1) return 0; // No countdown
    if (totalParticipants <= 9) return 1;
    if (totalParticipants <= 12) return 2;
    if (totalParticipants <= 17) return 3;
    return Math.ceil(totalParticipants * 0.2);
  }

  /** Should a countdown start given the current state? */
  shouldStart(totalParticipants: number, readyCount: number): boolean {
    if (totalParticipants <= 1) return false;
    const pending = totalParticipants - readyCount;
    const threshold = this.getPendingThreshold(totalParticipants);
    return pending > 0 && pending <= threshold;
  }

  /** Start a countdown for a session */
  start(sessionId: string, onExpire: () => void): Date {
    this.cancel(sessionId);

    const endsAt = new Date(Date.now() + this.durationMs);
    const timeout = setTimeout(() => {
      this.countdowns.delete(sessionId);
      this.logger.log(`Countdown expired for session ${sessionId}`);
      onExpire();
    }, this.durationMs);

    this.countdowns.set(sessionId, { timeout, endsAt });
    this.logger.log(
      `Countdown started for session ${sessionId}, expires at ${endsAt.toISOString()}`,
    );

    return endsAt;
  }

  /** Cancel an active countdown */
  cancel(sessionId: string): boolean {
    const existing = this.countdowns.get(sessionId);
    if (existing) {
      clearTimeout(existing.timeout);
      this.countdowns.delete(sessionId);
      this.logger.log(`Countdown cancelled for session ${sessionId}`);
      return true;
    }
    return false;
  }

  /** Check if a countdown is active */
  isActive(sessionId: string): boolean {
    return this.countdowns.has(sessionId);
  }

  /** Get the end time of an active countdown */
  getEndsAt(sessionId: string): Date | null {
    return this.countdowns.get(sessionId)?.endsAt ?? null;
  }
}
