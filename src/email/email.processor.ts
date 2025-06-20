import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { transporter } from './email.config';

@Processor('mail')
export class EmailProcessor {
  @Process('send_email')
  async handleSendEmail(job: Job) {
    const { to, subject, body } = job.data;

    console.log(`sending email to ${to}`);

    try {
      const info = await transporter.sendMail({
        from: '"My App" <your-email@gmail.com>', // sender
        to,
        subject,
        html: `<p>${body}</p>`, // or text: '...'
      });

      console.log(`sending email success : ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`failed to send email to ${to}`, err);
      throw err;
    }
  }
}
