import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class UpdateProductDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  options?: any[];

  @IsOptional()
  @IsArray()
  addons?: any[];

  @IsOptional()
  @IsBoolean()
  has_addon_limits?: boolean;

  @IsOptional()
  @IsNumber()
  min_addons?: number;

  @IsOptional()
  @IsNumber()
  max_addons?: number;
}
