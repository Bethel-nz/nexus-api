import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from 'src/utils/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: env.JWT_SECRET,
		});
	}

	async validate(payload: { sub: string, email: string, role: string }) {
		return {
			id: payload.sub,
			email: payload.email,
			role: payload.role
		};
	}
} 