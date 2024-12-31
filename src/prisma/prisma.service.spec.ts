import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { execSync } from 'child_process';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(async () => {
    // Ensure we're using test database
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/agora_test?schema=public";

    // Wait for test database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run migrations on test database
    execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    await service.$connect();
  });

  afterEach(async () => {
    // Clean up after each test
    await service.user.deleteMany();
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User Operations', () => {
    const testUser = {
      email: "jane@testmail.com",
      password: "some-super-secret-key",
      role: "REGULAR" as const,
    };

    it("should create a new user", async () => {
      const newUser = await service.user.create({
        data: testUser
      });

      expect(newUser).toHaveProperty("id");
      expect(newUser.email).toBe(testUser.email);
      expect(newUser.role).toBe(testUser.role);
    });

    it("should throw an error on duplicate email", async () => {
      // Create initial user
      await service.user.create({
        data: testUser
      });

      // Try to create duplicate
      await expect(
        service.user.create({
          data: {
            ...testUser,
            password: "different-password"
          }
        })
      ).rejects.toThrow(/Unique constraint failed/);
    });
  });
});
