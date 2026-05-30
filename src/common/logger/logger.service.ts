// src/common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class LoggerService implements NestLoggerService {
  private format(
    level: LogLevel,
    message: unknown,
    context?: string,
    meta?: Record<string, any>,
  ) {
    return JSON.stringify({
      level,
      message,
      context,
      meta,
      timestamp: new Date().toISOString(),
      pid: process.pid,
    });
  }

  log(message: unknown, context?: string) {
    process.stdout.write(this.format('log', message, context) + '\n');
  }

  error(message: unknown, trace?: string, context?: string) {
    process.stderr.write(
      this.format('error', message, context, { trace }) + '\n',
    );
  }

  warn(message: unknown, context?: string) {
    process.stdout.write(this.format('warn', message, context) + '\n');
  }

  debug(message: unknown, context?: string) {
    if (process.env.APP_ENV !== 'production') {
      process.stdout.write(this.format('debug', message, context) + '\n');
    }
  }

  verbose(message: unknown, context?: string) {
    process.stdout.write(this.format('verbose', message, context) + '\n');
  }
}
