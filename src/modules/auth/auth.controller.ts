import {
	Body,
	Controller,
	Post,
	UseGuards,
	UsePipes,
	HttpCode,
	HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto, createUserSchema } from '../users/users.dto';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(createUserSchema.omit({ role: true })))
	async login(@User() user) {
		return this.authService.login(user);
	}

	@Public()
	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@UsePipes(new ZodValidationPipe(createUserSchema))
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}
} 