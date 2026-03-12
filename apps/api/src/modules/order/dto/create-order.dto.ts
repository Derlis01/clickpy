import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  branch_id: string;

  @IsString()
  customer_phone: string;

  @IsString()
  customer_name: string;

  @IsOptional()
  @IsString()
  customer_email?: string;

  @IsArray()
  items: any[];

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  delivery_fee?: number;

  @IsNumber()
  total: number;

  @IsString()
  status: string;

  @IsString()
  type: string;

  @IsString()
  payment_method: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  delivery_address?: Record<string, any>;

  @IsOptional()
  @IsString()
  table_number?: string;

  @IsOptional()
  @IsNumber()
  estimated_time?: number;
}
