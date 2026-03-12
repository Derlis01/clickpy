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
    const organizationId = await this.orderRepository.getOrganizationIdByBranch(
      dto.branch_id,
    );

    // Upsert customer
    let customer = await this.customerRepository.getCustomerByPhone(
      organizationId,
      dto.customer_phone,
    );

    if (customer) {
      if (
        customer.name !== dto.customer_name ||
        customer.email !== (dto.customer_email || '')
      ) {
        customer = await this.customerRepository.updateCustomer(
          organizationId,
          dto.customer_phone,
          { name: dto.customer_name, email: dto.customer_email || '' },
        );
      }
    } else {
      customer = await this.customerRepository.createCustomer({
        organization_id: organizationId,
        phone: dto.customer_phone,
        name: dto.customer_name,
        email: dto.customer_email || '',
      });
    }

    const orderData = {
      branch_id: dto.branch_id,
      customer_id: customer?.id ?? null,
      customer_phone: dto.customer_phone,
      customer_name: dto.customer_name,
      items: dto.items,
      subtotal: dto.subtotal,
      delivery_fee: dto.delivery_fee ?? 0,
      total: dto.total,
      status: dto.status,
      type: dto.type,
      payment_method: dto.payment_method,
      notes: dto.notes || '',
      delivery_address: dto.delivery_address ?? null,
      table_number: dto.table_number ?? null,
      estimated_time: dto.estimated_time ?? null,
    };

    const order = await this.orderRepository.createOrder(orderData);
    return { success: true, message: 'Order created successfully', order };
  }
}
