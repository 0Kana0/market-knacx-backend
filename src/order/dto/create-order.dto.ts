import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from 'src/order-item/dto/create-order-item.dto';

export class CreateOrderDto {
  @IsOptional()
  id: number

  @IsNumber()
  @Min(0)
  totalBuyPrice: number

  @IsOptional()
  createdAt: Date;
  
  @IsOptional()
  updatedAt: Date;

  @IsNumber()
  @Min(0)
  userId: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItem: CreateOrderItemDto[];
}
