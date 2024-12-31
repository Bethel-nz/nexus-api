import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { env } from "src/utils/env"

const prisma = new PrismaClient();

global.beforeAll(async () => {
	if (process.env.NODE_ENV !== 'test') {
		throw new Error('Tests must be run in test environment');
	}

	try {
		// Clean database
		await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
		await prisma.$executeRaw`CREATE SCHEMA public`;

		// Run migrations
		execSync('npx prisma migrate deploy', {
			env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
			stdio: 'inherit',
		});
	} catch (error) {
		console.error('Database reset failed:', error);
		throw error;
	}
});

global.afterAll(async () => {
	await prisma.$disconnect();
}); 