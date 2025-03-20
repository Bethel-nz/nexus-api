import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: any, context?: string): void {
    this.printLog('log', message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    this.printLog('error', message, context, trace);
  }

  warn(message: any, context?: string): void {
    this.printLog('warn', message, context);
  }

  debug(message: any, context?: string): void {
    this.printLog('debug', message, context);
  }

  verbose(message: any, context?: string): void {
    this.printLog('verbose', message, context);
  }

  private printLog(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    message: any,
    context?: string,
    trace?: string
  ): void {
    const now = new Date();
    const logContext = context || this.context;

    const logEntry = {
      timestamp: now.toISOString(),
      level,
      context: logContext,
      message,
      ...(trace && { trace }),
    };

    // TODO: send logs to a centralized system
    console.log(JSON.stringify(logEntry));
  }
}
