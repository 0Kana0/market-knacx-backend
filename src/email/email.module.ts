import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './email.processor';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor, JwtService],
})
export class EmailModule {}
