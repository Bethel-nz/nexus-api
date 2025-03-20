import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

// Helper class for CreateOrderDto
export class CreateOrderRequest {
  @ApiProperty({
    description: 'Detailed description of the order',
    example: 'I need a website built with React and Node.js',
  })
  description: string;

  @ApiProperty({
    description: 'Technical specifications or requirements',
    example: {
      frontend: 'React',
      backend: 'Node.js',
      database: 'PostgreSQL',
    },
    type: 'object',
    additionalProperties: true,
    properties: {
      frontend: { type: 'string', example: 'React' },
      backend: { type: 'string', example: 'Node.js' },
      database: { type: 'string', example: 'PostgreSQL' },
    },
  })
  specifications: Record<string, any>;

  @ApiProperty({
    description: 'Number of items/units required',
    example: 1,
    minimum: 1,
  })
  quantity: number;
}

// Helper class for UpdateOrderDto
export class UpdateOrderRequest {
  @ApiProperty({
    description: 'New status for the order',
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  status: OrderStatus;
}

// Zod schemas
export const createOrderSchema = z.object({
  description: z.string(),
  specifications: z.record(z.any()),
  quantity: z.number().positive(),
});

export const updateOrderSchema = z.object({
  status: z.enum([
    OrderStatus.REVIEW,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
  ]),
});

// Types using both Zod and Swagger
export type CreateOrderDto = Required<z.infer<typeof createOrderSchema>> &
  CreateOrderRequest;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema> &
  UpdateOrderRequest;
