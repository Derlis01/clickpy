import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

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
