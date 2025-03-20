// src/monitoring/monitoring.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { BullMetricsService } from './bull-metrics.service';
import {
  BULL_JOBS_COMPLETED,
  BULL_JOBS_FAILED,
  BULL_QUEUE_SIZE,
} from './metrics.providers';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
  ],
  providers: [
    BullMetricsService,
    BULL_JOBS_COMPLETED,
    BULL_JOBS_FAILED,
    BULL_QUEUE_SIZE,
  ],
})
export class MonitoringModule {}
