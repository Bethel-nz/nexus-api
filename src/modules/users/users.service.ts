import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) { }

	async create(data: CreateUserDto): Promise<User> {
		const hashedPassword = await bcrypt.hash(data.password, 10);

		return this.prisma.user.create({
			data: {
				...data,
				password: hashedPassword,
			},
		});
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}

	async findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id },
		});
	}

	async update(id: string, data: UpdateUserDto): Promise<User> {
		const user = await this.findById(id);
		const updates = {
			...user,
			...data,
			password: data.password ? await bcrypt.hash(data.password, 10) : user.password,
		};

		return this.prisma.user.update({
			where: { id },
			data: updates,
		});
	}

	async validatePassword(user: User, password: string): Promise<boolean> {
		return bcrypt.compare(password, user.password);
	}
} 