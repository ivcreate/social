import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {

  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  initializeLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ dirname: "/var/log/nextjs/", filename: 'info.log', level: 'info' }),
        new winston.transports.File({ dirname: "/var/log/nextjs/", filename: 'error.log', level: 'error' }),
        new winston.transports.File({ dirname: "/var/log/nextjs/", filename: 'warn.log', level: 'warn' })
      ],
    });
  }

  error(message: string, trace: string) {
    this.logger.log("error", "MyLogger error - " + message);
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.log("warn", message);
  }

  log(message: string) {
    this.logger.log('info', message);
  }
}