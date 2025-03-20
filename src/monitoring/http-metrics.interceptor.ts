import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total') private counter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private histogram: Histogram<string>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const status = context.switchToHttp().getResponse().statusCode;
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds

          // Record metrics
          this.counter.inc({ method, path, status });
          this.histogram.observe({ method, path, status }, duration);
        },
        error: (error) => {
          const status = error.status || 500;
          const duration = (Date.now() - startTime) / 1000;

          this.counter.inc({ method, path, status });
          this.histogram.observe({ method, path, status }, duration);
        },
      })
    );
  }
}
