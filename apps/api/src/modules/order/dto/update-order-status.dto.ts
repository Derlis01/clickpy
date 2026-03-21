import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}
