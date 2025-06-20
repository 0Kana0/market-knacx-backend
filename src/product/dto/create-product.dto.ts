import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  id: number

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(0)
  stock: number

  @IsOptional()
  @IsString()
  detail?: string

  @IsOptional()
  createdAt: Date;
  
  @IsOptional()
  updatedAt: Date;
}
