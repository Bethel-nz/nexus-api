import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
	constructor(private readonly prisma: PrismaService) { }

	async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order & {
		chatRoom: ChatRoom;
	}> {
		return this.prisma.order.create({
			data: {
				...createOrderDto,
				userId,
				chatRoom: {
					create: {}
				}
			},
			include: {
				chatRoom: true
			}
		});
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
				chatRoom: true
			},
			skip,
			take,
			orderBy: { createdAt: 'desc' }
		});
	}

	async findOne(id: string, userId: string, role: UserRole): Promise<Order> {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: {
				user: true,
				chatRoom: true
			}
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		if (role !== UserRole.ADMIN && order.userId !== userId) {
			throw new ForbiddenException('Not authorized to access this order');
		}

		return order;
	}

	async updateStatus(id: string, updateOrderDto: UpdateOrderDto, role: UserRole): Promise<Order> {
		if (role !== UserRole.ADMIN) {
			throw new ForbiddenException('Only admins can update order status');
		}

		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { chatRoom: true }
		});

		if (!order) {
			throw new NotFoundException('Order not found');
		}

		if (
			updateOrderDto.status === OrderStatus.PROCESSING &&
			!order.chatRoom?.isClosed
		) {
			throw new ForbiddenException(
				'Chat room must be closed before moving to PROCESSING'
			);
		}

		// Validate status transition
		if (!this.isValidStatusTransition(order.status, updateOrderDto.status)) {
			throw new ForbiddenException('Invalid status transition');
		}

		return this.prisma.order.update({
			where: { id },
			data: updateOrderDto,
			include: {
				chatRoom: true
			}
		});
	}

	private isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
		const transitions = {
			[OrderStatus.REVIEW]: [OrderStatus.PROCESSING],
			[OrderStatus.PROCESSING]: [OrderStatus.COMPLETED],
			[OrderStatus.COMPLETED]: []
		};

		return transitions[current].includes(next);
	}
} 