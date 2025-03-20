// Package imports
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  UsePipes,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

// Internal imports
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  createOrderSchema,
  updateOrderSchema,
} from './orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OrderStatus } from '@prisma/client';

type JwtUser = { id: string; email: string; role: UserRole };

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('new')
  @Roles(UserRole.REGULAR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Website development project' },
        specifications: {
          type: 'object',
          example: {
            frontend: 'React',
            backend: 'Node.js',
            database: 'PostgreSQL',
          },
        },
        quantity: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        description: { type: 'string' },
        specifications: { type: 'object' },
        status: { type: 'string', enum: Object.values(OrderStatus) },
        quantity: { type: 'number' },
        userId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(
    @User() user: JwtUser,
    @Body(new ZodValidationPipe(createOrderSchema))
    createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of orders',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: Object.values(OrderStatus) },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll(
    @User() user: JwtUser,
    @Query() query: { page?: number; count?: number }
  ) {
    const skip = (query.page || 1) - 1;
    const take = query.count || 10;

    return this.ordersService.findAll(user.id, user.role, skip * take, take);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order identifier' })
  @ApiResponse({
    status: 200,
    description: 'Returns order details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        description: { type: 'string' },
        specifications: { type: 'object' },
        status: { type: 'string', enum: Object.values(OrderStatus) },
        quantity: { type: 'number' },
        userId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string, @User() user: JwtUser) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(OrderStatus),
          example: OrderStatus.PROCESSING,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: JwtUser
  ) {
    return this.ordersService.updateStatus(id, updateOrderDto, user.role);
  }
}
