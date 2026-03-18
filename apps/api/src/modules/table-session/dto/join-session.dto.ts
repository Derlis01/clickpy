import { IsString, IsOptional } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  token: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  allergies?: string;
}

export class RequestBillDto {
  @IsString()
  guest_token: string;
}

export class UpdateAllergiesDto {
  @IsString()
  guest_token: string;

  @IsString()
  allergies: string;
}

export class AddVirtualGuestDto {
  @IsString()
  display_name: string;
}

export class StaffOrderDto {
  @IsString()
  guest_name: string;

  items: any[];
}

export class UpdatePaymentDto {
  @IsString()
  status: 'paid' | 'not_paid';
}

export class UpdateItemStatusDto {
  item_index: number;

  @IsString()
  status: string;
}
