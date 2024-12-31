// Package imports
import { Controller, Get, Post, Body, Param, Patch, UseGuards, UsePipes, Query, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// Internal imports
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, createOrderSchema, updateOrderSchema } from './orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

type JwtUser = { id: string; email: string; role: UserRole };

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) { }

	@Post("new")
	@Roles(UserRole.REGULAR)
	@HttpCode(HttpStatus.CREATED)
	create(
		@User() user: JwtUser,
		@Body(new ZodValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto
	) {
		return this.ordersService.create(user.id, createOrderDto);
	}



	@Get()
	@HttpCode(HttpStatus.OK)
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
	findOne(@Param('id') id: string, @User() user: JwtUser) {
		return this.ordersService.findOne(id, user.id, user.role);
	}

	@Patch(':id/status')
	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(updateOrderSchema))
	updateStatus(
		@Param('id') id: string,
		@Body() updateOrderDto: UpdateOrderDto,
		@User() user: JwtUser
	) {
		return this.ordersService.updateStatus(id, updateOrderDto, user.role);
	}

} 