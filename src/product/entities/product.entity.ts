import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Order } from 'src/order/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  detail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // associate
  @OneToMany(() => OrderItem,  orderItem=> orderItem.product)
  orderItem: OrderItem[]
}
