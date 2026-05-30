// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;

          // Si tu logger espera un string como primer argumento, serializamos el objeto
          this.logger.log(
            JSON.stringify({
              method: request.method,

              url: request.url,
              durationMs: duration,
            }),
            'HTTP_REQUEST',
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - start;

          // SOLUCIÓN DEFINITIVA: Convertimos la instancia a un objeto de error estándar seguro para TypeScript
          const errorInstance =
            err instanceof Error ? err : new Error(String(err));

          this.logger.error(
            JSON.stringify({
              method: request.method,

              url: request.url,
              durationMs: duration,
              error: errorInstance.message,
            }),
            errorInstance.stack ?? 'No stack trace available',
            'HTTP_REQUEST_ERROR',
          );
        },
      }),
    );
  }
}
