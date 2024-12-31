import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/users.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) { }

	async validateUser(email: string, password: string): Promise<User> {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordValid = await this.usersService.validatePassword(
			user,
			password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		return user;
	}

	async login(user: User) {
		const payload = { sub: user.id, email: user.email, role: user.role };
		return {
			access_token: this.jwtService.sign(payload),
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		};
	}

	async register(createUserDto: CreateUserDto) {
		const existingUser = await this.usersService.findByEmail(createUserDto.email);
		if (existingUser) {
			throw new UnauthorizedException('Email already exists');
		}

		const user = await this.usersService.create(createUserDto);
		return this.login(user);
	}

} 