import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process('order-status')
  async handleOrderStatusNotification(job: Job) {
    this.logger.debug(`Processing order status notification job ${job.id}`);
    const { userId, orderId, status } = job.data;

    try {
      // Here you would integrate with your email service
      // For example: await this.emailService.sendEmail(...)
      this.logger.log(
        `Sent order status notification to user ${userId} for order ${orderId}`
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send order status notification: ${error.message}`,
        error.stack
      );
      throw error; // Rethrow to trigger Bull's retry mechanism
    }
  }

  @Process('chat-message')
  async handleChatNotification(job: Job) {
    this.logger.debug(`Processing chat notification job ${job.id}`);
    const { userId, chatRoomId, messagePreview } = job.data;

    try {
      // Here you would integrate with your email service
      // For example: await this.emailService.sendEmail(...)
      this.logger.log(
        `Sent chat notification to user ${userId} for chat room ${chatRoomId}`
      );
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send chat notification: ${error.message}`,
        error.stack
      );
      throw error; // Rethrow to trigger Bull's retry mechanism
    }
  }
}
