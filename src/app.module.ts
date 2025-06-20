import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Product } from './product/entities/product.entity';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order-item/entities/order-item.entity';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from './email/email.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    // ตั้งค่าฐานข้อมูลโดยใช้ค่าจาก .env
    DatabaseModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'market_db',
      entities: [User, Product, Order, OrderItem],
      synchronize: true,
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.DB_HOST,
        port: 6379,
        ttl: 60,
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    AuthModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
