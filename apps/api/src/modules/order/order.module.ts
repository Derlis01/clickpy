import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { CustomerRepository } from '../customer/customer.repository';

@Module({
  imports: [RealtimeModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, CustomerRepository],
})
export class OrderModule {}
