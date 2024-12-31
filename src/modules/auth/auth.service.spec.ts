import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from '../users/users.dto';

describe('AuthService Integration', () => {
	let service: AuthService;
	let prisma: PrismaService;

	beforeAll(async () => {
		// Wait for test database to be ready
		await new Promise(resolve => setTimeout(resolve, 1000));
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				UsersModule,
				JwtModule.register({
					secret: 'test-secret',
					signOptions: { expiresIn: '1d' },
				}),
			],
			providers: [AuthService],
		}).compile();

		service = module.get<AuthService>(AuthService);
		prisma = module.get<PrismaService>(PrismaService);
		await prisma.$connect();
	});

	afterEach(async () => {
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe('Registration', () => {
		const registerDto: CreateUserDto = {
			email: 'test@example.com',
			password: 'password123',
			role: UserRole.REGULAR,
		};

		it('should register a new user', async () => {
			const result = await service.register(registerDto);

			expect(result).toHaveProperty('access_token');
			expect(result.user).toMatchObject({
				email: registerDto.email,
				role: registerDto.role,
			});
		});

		it('should throw on duplicate email', async () => {
			await service.register(registerDto);

			await expect(service.register(registerDto))
				.rejects
				.toThrow(UnauthorizedException);
		});
	});

	describe('Authentication', () => {
		const testUser: CreateUserDto = {
			email: 'auth@example.com',
			password: 'password123',
			role: UserRole.REGULAR,
		};

		beforeEach(async () => {
			await service.register(testUser);
		});

		it('should validate correct credentials', async () => {
			const user = await service.validateUser(
				testUser.email,
				testUser.password,
			);

			expect(user).toMatchObject({
				email: testUser.email,
				role: testUser.role,
			});
		});

		it('should reject invalid password', async () => {
			await expect(
				service.validateUser(testUser.email, 'wrong-password')
			).rejects.toThrow(UnauthorizedException);
		});

		it('should reject non-existent email', async () => {
			await expect(
				service.validateUser('wrong@email.com', testUser.password)
			).rejects.toThrow(UnauthorizedException);
		});

		it('should generate valid JWT on login', async () => {
			const user = await service.validateUser(
				testUser.email,
				testUser.password,
			);
			const result = await service.login(user);

			expect(result).toHaveProperty('access_token');
			expect(result.user).toMatchObject({
				email: testUser.email,
				role: testUser.role,
			});
		});
	});
}); 