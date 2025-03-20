// Package imports
import { Module } from '@nestjs/common';

// Internal imports
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, NotificationsModule, RedisCacheModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
