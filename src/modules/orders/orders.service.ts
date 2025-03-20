import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './orders.dto';
import { ChatRoom, Order, OrderStatus, UserRole } from '@prisma/client';

/**
 * Create a new order
 * @param userId - The ID of the user creating the order
 * @param createOrderDto - The data for the new order
 * @returns The created order with its associated chat room
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto
  ): Promise<
    Order & {
      chatRoom: ChatRoom;
    }
  > {
    const order = await this.prisma.order.create({
      data: {
        ...createOrderDto,
        userId,
        chatRoom: {
          create: {},
        },
      },
      include: {
        chatRoom: true,
      },
    });

    // Send notification about new order
    await this.notificationsService.sendOrderStatusNotification(
      userId,
      order.id,
      OrderStatus.REVIEW
    );

    this.logger.log(`Created new order ${order.id} for user ${userId}`);
    return order;
  }

  async findAll(
    userId: string,
    role: UserRole,
    skip = 0,
    take = 10
  ): Promise<(Order & { chatRoom: ChatRoom | null })[]> {
    const where = role === UserRole.ADMIN ? {} : { userId };

    return this.prisma.order.findMany({
      where,
      include: {
        ...(role === UserRole.ADMIN && { user: true }),
        chatRoom: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Order> {
    // Try to get from cache first
    const cacheKey = `order:${id}`;
    const cachedOrder = await this.cacheManager.get<Order>(cacheKey);

    if (cachedOrder) {
      this.logger.debug(`Cache hit for order ${id}`);
      return cachedOrder;
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        chatRoom: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${id}`);
      throw new NotFoundException('Order not found');
    }

    if (role !== UserRole.ADMIN && order.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access order ${id} without permission`
      );
      throw new ForbiddenException('Not authorized to access this order');
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, order, 60 * 15); // Cache for 15 minutes
    return order;
  }

  async updateStatus(
    id: string,
    updateOrderDto: UpdateOrderDto,
    role: UserRole
  ): Promise<Order> {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update order status');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { chatRoom: true },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${id}`);
      throw new NotFoundException('Order not found');
    }

    if (
      updateOrderDto.status === OrderStatus.PROCESSING &&
      !order.chatRoom?.isClosed
    ) {
      this.logger.warn(
        `Attempted to move order ${id} to PROCESSING with open chat room`
      );
      throw new ForbiddenException(
        'Chat room must be closed before moving to PROCESSING'
      );
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, updateOrderDto.status)) {
      this.logger.warn(
        `Invalid status transition from ${order.status} to ${updateOrderDto.status}`
      );
      throw new ForbiddenException('Invalid status transition');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        chatRoom: true,
      },
    });

    // Send notification about status change
    await this.notificationsService.sendOrderStatusNotification(
      order.userId,
      order.id,
      updateOrderDto.status
    );

    this.logger.log(`Order ${id} status updated to ${updateOrderDto.status}`);
    return updatedOrder;
  }

  private isValidStatusTransition(
    current: OrderStatus,
    next: OrderStatus
  ): boolean {
    const transitions = {
      [OrderStatus.REVIEW]: [OrderStatus.PROCESSING],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
    };

    return transitions[current].includes(next);
  }
}
