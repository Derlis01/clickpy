import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
