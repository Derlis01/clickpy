import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateVisibilityDto {
  @IsArray()
  @IsString({ each: true })
  product_ids: string[];

  @IsBoolean()
  is_hidden: boolean;
}
