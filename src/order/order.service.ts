import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // เริ่มต้นใช้งาน Transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = new Order()
      order.userId = createOrderDto.userId
      order.totalBuyPrice = createOrderDto.totalBuyPrice
      // เก็บข้อมูลลงใน database
      await queryRunner.manager.save(order)
      
      for (const item of createOrderDto.orderItem) {
        // ถ้าไม่เจอ product จะ error
        const product = await queryRunner.manager.findOneByOrFail(Product, {
          id: item.productId,
        });

        // เกิด error ถ้า stock น้อยกว่า amount
        if (product.stock < item.amount) {
          throw new Error(`Stock not enough for product ${product.id}`);
        }

        // ลบ stock ตามจำนวน amount
        product.stock -= item.amount;
        // เก็บข้อมูลลงใน database
        await queryRunner.manager.save(product);

        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.product = product;
        orderItem.amount = item.amount;
        orderItem.buyPrice = item.buyPrice;
        // เก็บข้อมูลลงใน database
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      // ถ้าเกิด error ยกเลิกการเก็บข้อมูลทั้งหมด
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const order = await this.orderRepository.find({
      relations: ['orderItem', 'orderItem.product'],
    });

    if (order.length == 0) {
      throw new NotFoundException(`order not found`);
    }

    return order
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id: id },
      relations: ['orderItem', 'orderItem.product'],
    });

    if (!order) {
      throw new NotFoundException(`order id ${id} not found`);
    }

    return order
  }
  

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
