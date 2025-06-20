import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { LoggingMiddleware } from './middleware/logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // เพิ่ม api/ หน้า Endpoint ทุกอัน
  app.setGlobalPrefix('api');
  // ใช้งาน morgan แบบ common log
  app.use(morgan('dev'));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  app.enableCors()
  // สร้าง Logging สำหรับตรวจสอบการใช้งาน api
  app.use(new LoggingMiddleware().use);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
