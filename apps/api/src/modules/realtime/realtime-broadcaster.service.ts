import { Injectable } from '@nestjs/common';
import { RealtimeBroadcaster } from '../table-session/realtime-broadcaster.interface';
import { RealtimeGateway } from './realtime.gateway';

/**
 * Concrete implementation of RealtimeBroadcaster.
 * Bridges REST controllers to the WebSocket gateway.
 */
@Injectable()
export class RealtimeBroadcasterService extends RealtimeBroadcaster {
  constructor(private readonly gateway: RealtimeGateway) {
    super();
  }

  toTable(sessionId: string, event: string, data: any): void {
    this.gateway.broadcastToTable(sessionId, event, data);
  }

  toKitchen(branchId: string, event: string, data: any): void {
    this.gateway.broadcastToKitchen(branchId, event, data);
  }

  toFloor(branchId: string, event: string, data: any): void {
    this.gateway.broadcastToFloor(branchId, event, data);
  }

  triggerConfirmRound(sessionId: string): void {
    this.gateway.triggerConfirmRound(sessionId);
  }

  addStaffItems(sessionId: string, guestName: string, items: any[]): void {
    this.gateway.addStaffItems(sessionId, guestName, items);
  }
}
