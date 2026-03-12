import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  schedule?: any[];

  @IsOptional()
  @IsObject()
  payment_methods?: Record<string, any>;

  @IsOptional()
  @IsObject()
  shipping_methods?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  ask_payment_method?: boolean;
}
