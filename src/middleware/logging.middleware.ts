// src/middleware/logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // ทำงานเมื่อ api ส่ง response เรียบร้อย
    res.on('finish', () => {
      // เวลาในการประมวลผลจอง api
      const duration = Date.now() - start;
      const log = `[${new Date().toISOString()}] ${req.originalUrl} ${req.method} ${duration}ms\n`;

      // กำหนด path ของไฟล์
      const logPath = path.join(__dirname, '../../logs', 'logging.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });

      // เขียน log ลงในไฟล์ที่สร้าง
      fs.appendFile(logPath, log, (error) => {
        if (error) {
          console.error('failed to write log', error);
        }
      });
    });

    next();
  }
}
