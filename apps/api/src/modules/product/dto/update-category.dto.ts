import { IsArray, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsArray()
  @IsString({ each: true })
  product_ids: string[];

  @IsString()
  new_category_name: string;
}
