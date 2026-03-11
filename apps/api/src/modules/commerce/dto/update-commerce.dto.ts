import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CommerceScheduleHoursDto {
  endUtcDate: string;
  initUtcDate: string;
}

export class CommerceScheduleDto {
  dayNumber: number;
  active: boolean;
  hours: CommerceScheduleHoursDto[];
  day: string;
}

export class UpdateCommerceDto {
  @IsOptional()
  @IsString()
  commerce_name?: string;

  @IsOptional()
  @IsString()
  commerce_slug?: string;

  @IsOptional()
  @IsString()
  commerce_phone?: string;

  @IsOptional()
  @IsString()
  commerce_address?: string;

  @IsOptional()
  @IsString()
  commerce_logo?: string;

  @IsOptional()
  @IsString()
  commerce_banner?: string;

  @IsOptional()
  @IsString()
  commerce_primary_color?: string;

  @IsOptional()
  @IsString()
  commerce_category?: string;

  @IsOptional()
  @IsBoolean()
  ask_payment_method?: boolean;

  @IsOptional()
  @IsArray()
  commerce_schedule?: CommerceScheduleDto[];
}
