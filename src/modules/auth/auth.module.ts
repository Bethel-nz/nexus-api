import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { env } from 'src/utils/env';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: env.JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule { } 