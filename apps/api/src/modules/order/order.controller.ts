import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-request';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ─── Public (storefront) ───

  @Public()
  @Post('public/order')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  // ─── Auth required (admin) ───

  @Get('orders')
  async getOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const orders = await this.orderService.findByBranch(user.branchId, {
      status,
      type,
      from,
      to,
    });
    return { orders };
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const order = await this.orderService.findById(id);
    return { order };
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(
      id,
      user.branchId,
      dto.status,
      dto.cancellation_reason,
    );
    return { order };
  }
}
