import {
  makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

export const BULL_JOBS_COMPLETED = makeCounterProvider({
  name: 'bull_jobs_completed_total',
  help: 'Total completed Bull jobs',
  labelNames: ['queue', 'type'],
});

export const BULL_JOBS_FAILED = makeCounterProvider({
  name: 'bull_jobs_failed_total',
  help: 'Total failed Bull jobs',
  labelNames: ['queue', 'type'],
});

export const BULL_QUEUE_SIZE = makeGaugeProvider({
  name: 'bull_queue_size',
  help: 'Current Bull queue sizes',
  labelNames: ['queue', 'state'],
});
