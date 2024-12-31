import { z } from 'zod';

const envSchema = z.object({
	JWT_SECRET: z.string().min(1, "JWT SECRET IS REQUIRED"),
	PORT: z.string().min(1, "PORT IS REQUIRED").transform(Number),
	DATABASE_URL: z.string().min(1, "DATABASE URL IS REQUIRED"),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
	try {
		const parsed = envSchema.parse(process.env);

		return parsed;
	} catch (error) {
		console.error('Invalid environment variables:', error);
		throw new Error('Invalid environment variables');
	}
}

export const env = validateEnv();