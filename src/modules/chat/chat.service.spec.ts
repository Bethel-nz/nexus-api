import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { execSync } from 'child_process';

describe('ChatService Integration', () => {
	let service: ChatService;
	let prisma: PrismaService;
	let testUser: { id: string; email: string; role: UserRole };
	let adminUser: { id: string; email: string; role: UserRole };
	let testOrder;
	let chatRoom;

	beforeAll(async () => {
		// Wait for test database to be ready
		await new Promise(resolve => setTimeout(resolve, 1000));
		// Run migrations on test database
		execSync('npx prisma migrate deploy');
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ChatService, PrismaService],
		}).compile();

		service = module.get<ChatService>(ChatService);
		prisma = module.get<PrismaService>(PrismaService);
		await prisma.$connect();

		// Create test users
		testUser = await prisma.user.create({
			data: {
				email: 'user@test.com',
				password: 'password',
				role: UserRole.REGULAR,
			},
		});

		adminUser = await prisma.user.create({
			data: {
				email: 'admin@test.com',
				password: 'password',
				role: UserRole.ADMIN,
			},
		});

		// Create test order with chat room
		testOrder = await prisma.order.create({
			data: {
				description: 'Test Order',
				specifications: {},
				quantity: 1,
				userId: testUser.id,
				chatRoom: {
					create: {},
				},
			},
			include: {
				chatRoom: true,
			},
		});

		chatRoom = testOrder.chatRoom;
	});

	afterEach(async () => {
		await prisma.message.deleteMany();
		await prisma.chatRoom.deleteMany();
		await prisma.order.deleteMany();
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe('sendMessage', () => {
		it('should allow user to send message to their chat room', async () => {
			const message = await service.sendMessage(
				chatRoom.id,
				testUser.id,
				'Test message',
				UserRole.REGULAR
			);

			expect(message.content).toBe('Test message');
			expect(message.userId).toBe(testUser.id);
		});

		it('should allow admin to send message to any chat room', async () => {
			const message = await service.sendMessage(
				chatRoom.id,
				adminUser.id,
				'Admin message',
				UserRole.ADMIN
			);

			expect(message.content).toBe('Admin message');
			expect(message.userId).toBe(adminUser.id);
		});

		it('should not allow messages in closed chat room', async () => {
			await prisma.chatRoom.update({
				where: { id: chatRoom.id },
				data: { isClosed: true },
			});

			await expect(
				service.sendMessage(
					chatRoom.id,
					testUser.id,
					'Test message',
					UserRole.REGULAR
				)
			).rejects.toThrow(ForbiddenException);
		});
	});

	describe('closeChat', () => {
		it('should allow admin to close chat room with summary', async () => {
			const closed = await service.closeChat(
				chatRoom.id,
				adminUser.id,
				'Chat concluded',
				UserRole.ADMIN
			);

			expect(closed.isClosed).toBe(true);
			expect(closed.summary).toBe('Chat concluded');
		});

		it('should not allow regular user to close chat room', async () => {
			await expect(
				service.closeChat(
					chatRoom.id,
					testUser.id,
					'Summary',
					UserRole.REGULAR
				)
			).rejects.toThrow(ForbiddenException);
		});
	});
}); 