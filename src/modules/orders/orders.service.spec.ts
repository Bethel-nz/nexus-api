import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, UserRole } from '@prisma/client';
import { execSync } from 'child_process';

describe('OrdersService Integration', () => {
	let service: OrdersService;
	let prisma: PrismaService;
	let testUser: { id: string; email: string; role: UserRole };
	let adminUser: { id: string; email: string; role: UserRole };

	beforeAll(async () => {
		// Wait for test database to be ready
		await new Promise(resolve => setTimeout(resolve, 1000));
		// Run migrations on test database
		execSync('npx prisma migrate deploy');
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [OrdersService, PrismaService],
		}).compile();

		service = module.get<OrdersService>(OrdersService);
		prisma = module.get<PrismaService>(PrismaService);
		await prisma.$connect();

		// Create test users
		const user = await prisma.user.create({
			data: {
				email: 'test@example.com',
				password: 'password123',
				role: UserRole.REGULAR,
			},
		});

		const admin = await prisma.user.create({
			data: {
				email: 'admin@example.com',
				password: 'password123',
				role: UserRole.ADMIN,
			},
		});

		testUser = user;
		adminUser = admin;
	});

	afterEach(async () => {
		// Clean up in correct order (respect foreign keys)
		await prisma.message.deleteMany();
		await prisma.chatRoom.deleteMany();
		await prisma.order.deleteMany();
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe('create', () => {
		const orderData = {
			description: 'Test order',
			specifications: { color: 'blue', size: 'large' },
			quantity: 1,
		};

		it('should create an order with chat room', async () => {
			const order = await service.create(testUser.id, orderData);

			expect(order).toHaveProperty('id');
			expect(order.description).toBe(orderData.description);
			expect(order.specifications).toEqual(orderData.specifications);
			expect(order.quantity).toBe(orderData.quantity);
			expect(order.status).toBe('REVIEW');
			expect(order.chatRoom).toBeDefined();
			expect(order.userId).toBe(testUser.id);
		});
	});

	describe('findAll', () => {
		beforeEach(async () => {
			// Create test orders
			await service.create(testUser.id, {
				description: 'Order 1',
				specifications: {},
				quantity: 1,
			});
			await service.create(testUser.id, {
				description: 'Order 2',
				specifications: {},
				quantity: 1,
			});
		});

		it('should return all orders for admin', async () => {
			const orders = await service.findAll(adminUser.id, adminUser.role);
			expect(orders).toHaveLength(2);
		});

		it('should return only user orders for regular user', async () => {
			const orders = await service.findAll(testUser.id, testUser.role);
			expect(orders).toHaveLength(2);
			orders.forEach(order => {
				expect(order.userId).toBe(testUser.id);
			});
		});
	});

	describe('findOne', () => {
		let testOrder: Order;

		beforeEach(async () => {
			testOrder = await service.create(testUser.id, {
				description: 'Test order',
				specifications: {},
				quantity: 1,
			});
		});

		it('should return order for owner', async () => {
			const order = await service.findOne(testOrder.id, testUser.id, testUser.role);
			expect(order.id).toBe(testOrder.id);
		});

		it('should return order for admin', async () => {
			const order = await service.findOne(testOrder.id, adminUser.id, adminUser.role);
			expect(order.id).toBe(testOrder.id);
		});

		it('should throw error for non-owner regular user', async () => {
			const otherUser = await prisma.user.create({
				data: {
					email: 'other@example.com',
					password: 'password123',
					role: UserRole.REGULAR,
				},
			});

			await expect(
				service.findOne(testOrder.id, otherUser.id, otherUser.role)
			).rejects.toThrow(ForbiddenException);
		});

		it('should throw error for non-existent order', async () => {
			await expect(
				service.findOne('non-existent-id', testUser.id, testUser.role)
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateStatus', () => {
		let testOrder: Order;

		beforeEach(async () => {
			testOrder = await service.create(testUser.id, {
				description: 'Test order',
				specifications: {},
				quantity: 1,
			});
		});

		it('should not allow PROCESSING status if chat is not closed', async () => {
			await expect(
				service.updateStatus(
					testOrder.id,
					{ status: OrderStatus.PROCESSING },
					UserRole.ADMIN
				)
			).rejects.toThrow('Chat room must be closed');
		});

		it('should allow PROCESSING status after chat is closed', async () => {
			// Close chat room first
			await prisma.chatRoom.update({
				where: { orderId: testOrder.id },
				data: { isClosed: true }
			});

			const updated = await service.updateStatus(
				testOrder.id,
				{ status: OrderStatus.PROCESSING },
				UserRole.ADMIN
			);

			expect(updated.status).toBe(OrderStatus.PROCESSING);
		});
	});
}); 