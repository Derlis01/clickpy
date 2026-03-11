import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  commerce_id: string;

  @IsString()
  customer_phone: string;

  @IsString()
  customer_name: string;

  @IsOptional()
  @IsString()
  customer_email?: string;

  @IsArray()
  products: any[];

  @IsNumber()
  order_timestamp: number;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  total: number;

  @IsString()
  currency: string;

  @IsString()
  order_status: string;

  @IsString()
  order_type: string;

  @IsString()
  payment_method: string;
}
