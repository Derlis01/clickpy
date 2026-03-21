import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @IsUUID()
  id: string;

  @IsInt()
  sort_order: number;
}

export class ReorderProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
