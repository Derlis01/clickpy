/**
 * Abstract interface for broadcasting events from REST controllers to Socket.io rooms.
 * Implemented by the RealtimeModule, injected into TableSessionController.
 * This decouples REST controllers from Socket.io internals.
 */
export abstract class RealtimeBroadcaster {
  abstract toTable(sessionId: string, event: string, data: any): void;
  abstract toKitchen(branchId: string, event: string, data: any): void;
  abstract toFloor(branchId: string, event: string, data: any): void;
  abstract triggerConfirmRound(sessionId: string): void;
  abstract addStaffItems(
    sessionId: string,
    guestName: string,
    items: any[],
  ): void;
}
