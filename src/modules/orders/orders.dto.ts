import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
	description: z.string(),
	specifications: z.record(z.any()),
	quantity: z.number().positive()
});

export const updateOrderSchema = z.object({
	status: z.enum([OrderStatus.REVIEW, OrderStatus.PROCESSING, OrderStatus.COMPLETED]),
});

export type CreateOrderDto = Required<z.infer<typeof createOrderSchema>>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>; 