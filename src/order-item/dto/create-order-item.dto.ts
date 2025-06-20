import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsOptional()
  id: number

  @IsNumber()
  @Min(0)
  amount: number

  @IsNumber()
  @Min(0)
  buyPrice: number

  @IsOptional()
  createdAt: Date;
  
  @IsOptional()
  updatedAt: Date;

  @IsNumber()
  @Min(0)
  productId: number
}
