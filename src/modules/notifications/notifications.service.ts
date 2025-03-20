import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {}

  async sendOrderStatusNotification(
    userId: string,
    orderId: string,
    status: string
  ) {
    this.logger.log(
      `Queueing order status notification for user ${userId}, order ${orderId}`
    );

    return this.notificationsQueue.add(
      'order-status',
      {
        userId,
        orderId,
        status,
        timestamp: new Date(),
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );
  }

  async sendChatNotification(
    userId: string,
    chatRoomId: string,
    messagePreview: string
  ) {
    this.logger.log(`Queueing chat notification for user ${userId}`);

    return this.notificationsQueue.add(
      'chat-message',
      {
        userId,
        chatRoomId,
        messagePreview,
        timestamp: new Date(),
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );
  }
}
