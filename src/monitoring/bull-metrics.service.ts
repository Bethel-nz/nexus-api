import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';
import { getQueueToken } from '@nestjs/bull';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bull';

@Injectable()
export class BullMetricsService implements OnModuleInit {
  constructor(
    @InjectMetric('bull_jobs_completed_total')
    private jobsCompletedCounter: Counter<string>,
    @InjectMetric('bull_jobs_failed_total')
    private jobsFailedCounter: Counter<string>,
    @InjectMetric('bull_queue_size')
    private queueSizeGauge: Gauge<string>,
    private moduleRef: ModuleRef
  ) {}

  async onModuleInit() {
    try {
      // Get the notifications queue
      const notificationsQueue = this.moduleRef.get<Queue>(
        getQueueToken('notifications'),
        { strict: false }
      );

      // Track completed jobs
      notificationsQueue.on('completed', (job) => {
        this.jobsCompletedCounter.inc({
          queue: 'notifications',
          type: job.name,
        });
      });

      // Track failed jobs
      notificationsQueue.on('failed', (job) => {
        this.jobsFailedCounter.inc({
          queue: 'notifications',
          type: job.name,
        });
      });

      // Update queue size metrics every 5 seconds
      setInterval(async () => {
        const waiting = await notificationsQueue.getWaitingCount();
        const active = await notificationsQueue.getActiveCount();
        const delayed = await notificationsQueue.getDelayedCount();

        this.queueSizeGauge.set(
          { queue: 'notifications', state: 'waiting' },
          waiting
        );
        this.queueSizeGauge.set(
          { queue: 'notifications', state: 'active' },
          active
        );
        this.queueSizeGauge.set(
          { queue: 'notifications', state: 'delayed' },
          delayed
        );
      }, 5000);
    } catch (error) {
      console.error('Failed to set up Bull metrics:', error);
    }
  }
}
