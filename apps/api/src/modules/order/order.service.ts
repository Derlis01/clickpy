import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CustomerRepository } from '../customer/customer.repository';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    // Check if customer already exists
    const existingCustomer = await this.customerRepository.getCustomerByPhone(
      dto.commerce_id,
      dto.customer_phone,
    );

    if (existingCustomer) {
      // Update customer if name or email changed
      if (
        existingCustomer.customer_name !== dto.customer_name ||
        existingCustomer.customer_email !== (dto.customer_email || '')
      ) {
        await this.customerRepository.updateCustomer(
          dto.commerce_id,
          dto.customer_phone,
          {
            customer_name: dto.customer_name,
            customer_email: dto.customer_email || '',
          },
        );
      }
    } else {
      // Create new customer
      await this.customerRepository.createCustomer({
        commerce_id: dto.commerce_id,
        customer_phone: dto.customer_phone,
        customer_name: dto.customer_name,
        customer_email: dto.customer_email || '',
      });
    }

    // Create the order
    const orderData = {
      commerce_id: dto.commerce_id,
      customer_phone: dto.customer_phone,
      customer_name: dto.customer_name,
      customer_email: dto.customer_email || '',
      products: dto.products,
      subtotal: dto.subtotal,
      total: dto.total,
      currency: dto.currency,
      order_status: dto.order_status,
      order_type: dto.order_type,
      payment_method: dto.payment_method,
      order_timestamp: dto.order_timestamp,
      order_date: new Date(dto.order_timestamp).toISOString(),
    };

    const order = await this.orderRepository.createOrder(orderData);

    return {
      success: true,
      message: 'Order created successfully',
      order,
    };
  }
}
