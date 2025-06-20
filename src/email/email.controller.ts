import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtGuard)
  @Post()
  async sendEmail(@Body() body: { to: string; subject: string; message: string }) {
    return this.emailService.sendEmail(body.to, body.subject, body.message);
  }

  @UseGuards(JwtGuard)
  @Get('status')
  async status() {
    return this.emailService.getQueueStatus();
  }

  // @Post()
  // create(@Body() createEmailDto: CreateEmailDto) {
  //   return this.emailService.create(createEmailDto);
  // }

  // @Get()
  // findAll() {
  //   return this.emailService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.emailService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
  //   return this.emailService.update(+id, updateEmailDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.emailService.remove(+id);
  // }
}
