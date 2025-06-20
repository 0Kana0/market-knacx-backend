import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('mail') private mailQueue: Queue
  ) {}

  async sendEmail(to: string, subject: string, body: string) {
    const job = await this.mailQueue.add('send_email', {
      to,
      subject,
      body,
    });

    return { jobId: job.id };
  }

  async getQueueStatus() {
    return {
      waiting: await this.mailQueue.getWaitingCount(),
      active: await this.mailQueue.getActiveCount(),
      completed: await this.mailQueue.getCompletedCount(),
      failed: await this.mailQueue.getFailedCount(),
    };
  }

  // create(createEmailDto: CreateEmailDto) {
  //   return 'This action adds a new email';
  // }

  // findAll() {
  //   return `This action returns all email`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} email`;
  // }

  // update(id: number, updateEmailDto: UpdateEmailDto) {
  //   return `This action updates a #${id} email`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} email`;
  // }
}
