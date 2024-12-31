import { UserRole } from '@prisma/client';
import { z } from 'zod';


export const createUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum([UserRole.ADMIN, UserRole.REGULAR]).default(UserRole.REGULAR),
});

export const updateUserSchema = z.object({
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	role: z.enum([UserRole.ADMIN, UserRole.REGULAR]).optional(),
});

export type CreateUserDto = Required<z.infer<typeof createUserSchema>>; // ensure the fields are non-optional since zod inference makes a field optional
export type UpdateUserDto = z.infer<typeof updateUserSchema>; 