import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { TableSessionService } from './table-session.service';
import { RealtimeBroadcaster } from './realtime-broadcaster.interface';
import {
  JoinSessionDto,
  RequestBillDto,
  UpdateAllergiesDto,
  AddVirtualGuestDto,
  StaffOrderDto,
  UpdatePaymentDto,
  UpdateItemStatusDto,
} from './dto/join-session.dto';

@Controller()
export class TableSessionController {
  constructor(
    private readonly sessionService: TableSessionService,
    private readonly realtimeBroadcaster: RealtimeBroadcaster,
  ) {}

  // ── Public (client) endpoints ──

  @Public()
  @Get('public/mesa/:tableId/session')
  getOrCreateSession(@Param('tableId') tableId: string) {
    return this.sessionService.getOrCreateSession(tableId);
  }

  @Public()
  @Post('public/mesa/:tableId/join')
  joinSession(@Param('tableId') tableId: string, @Body() dto: JoinSessionDto) {
    return this.sessionService
      .getOrCreateSession(tableId)
      .then((session) =>
        this.sessionService.joinSession(
          session.id,
          dto.token,
          dto.name,
          dto.allergies,
        ),
      );
  }

  @Public()
  @Post('public/mesa/session/:sid/bill')
  async requestBill(@Param('sid') sid: string, @Body() dto: RequestBillDto) {
    const bill = await this.sessionService.requestBill(sid, dto.guest_token);
    this.realtimeBroadcaster.toTable(sid, 'bill:requested', bill);
    return bill;
  }

  @Public()
  @Post('public/mesa/session/:sid/confirm')
  confirmRound(@Param('sid') sid: string) {
    this.realtimeBroadcaster.triggerConfirmRound(sid);
    return { ok: true };
  }

  @Public()
  @Post('public/mesa/session/:sid/allergies')
  async updateAllergies(
    @Param('sid') sid: string,
    @Body() dto: UpdateAllergiesDto,
  ) {
    return this.sessionService.updateAllergies(
      sid,
      dto.guest_token,
      dto.allergies,
    );
  }

  @Public()
  @Get('public/mesa/session/:sid/orders')
  getSessionOrders(@Param('sid') sid: string) {
    return this.sessionService.getSessionOrders(sid);
  }

  // ── Kitchen endpoints ──

  @Public()
  @Get('kitchen/:branchId/orders')
  getKitchenOrders(@Param('branchId') branchId: string) {
    return this.sessionService.getKitchenOrders(branchId);
  }

  @Public()
  @Patch('kitchen/order/:orderId/item')
  async updateItemStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    const { order, sessionId } = await this.sessionService.updateItemStatus(
      orderId,
      dto.item_index,
      dto.status,
    );

    this.realtimeBroadcaster.toTable(sessionId, 'order:status_changed', {
      order_id: orderId,
      item_index: dto.item_index,
      status: dto.status,
    });

    if (dto.status === 'ready' && order.table_session_id) {
      const session = await this.sessionService.getSession(
        order.table_session_id,
      );
      if (session) {
        this.realtimeBroadcaster.toFloor(
          session.branch_id,
          'floor:item_ready',
          {
            order_id: orderId,
            table_name: `Mesa`,
            session_id: sessionId,
          },
        );
      }
    }

    return order;
  }

  // ── Staff endpoints ──

  @Post('staff/table/:sid/guest')
  async addVirtualGuest(
    @Param('sid') sid: string,
    @Body() dto: AddVirtualGuestDto,
  ) {
    const guest = await this.sessionService.addVirtualGuest(
      sid,
      dto.display_name,
    );
    this.realtimeBroadcaster.toTable(sid, 'guest:joined', {
      display_name: guest.display_name,
      guest_id: guest.id,
      is_virtual: true,
    });
    return guest;
  }

  @Post('staff/table/:sid/order')
  async staffOrder(@Param('sid') sid: string, @Body() dto: StaffOrderDto) {
    const result = await this.sessionService.createStaffOrder(
      sid,
      dto.guest_name,
      dto.items,
    );
    this.realtimeBroadcaster.addStaffItems(sid, dto.guest_name, dto.items);
    return result;
  }

  @Patch('staff/table/:sid/guest/:gid/payment')
  async markPayment(
    @Param('sid') sid: string,
    @Param('gid') gid: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    const { guest, allPaid } = await this.sessionService.markPayment(
      sid,
      gid,
      dto.status,
    );

    this.realtimeBroadcaster.toTable(sid, 'bill:paid', {
      guest_id: gid,
      guest_name: guest.display_name,
      payment_status: dto.status,
    });

    if (allPaid) {
      this.realtimeBroadcaster.toTable(sid, 'session:closed', {
        reason: 'all_paid',
      });
    }

    return guest;
  }

  @Delete('staff/table/:sid/guest/:gid')
  async removeGuest(@Param('sid') sid: string, @Param('gid') gid: string) {
    const guest = await this.sessionService.removeGuest(sid, gid);
    this.realtimeBroadcaster.toTable(sid, 'guest:left', {
      display_name: guest.display_name,
      guest_id: gid,
      removed_by_staff: true,
    });
    return guest;
  }

  @Get('staff/tables')
  getActiveTables() {
    return [];
  }

  @Patch('staff/table/:sid/close')
  async closeTable(@Param('sid') sid: string) {
    const session = await this.sessionService.getSession(sid);
    if (!session) return { error: 'Session not found' };
    this.realtimeBroadcaster.toTable(sid, 'session:closed', {
      reason: 'staff_closed',
    });
    return session;
  }
}
