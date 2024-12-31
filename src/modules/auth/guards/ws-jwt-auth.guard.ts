import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: Socket = context.switchToWs().getClient();
		const token = this.extractToken(client);

		try {
			const payload = this.jwtService.verify(token);
			client.data.user = payload;
			return true;
		} catch {
			throw new WsException('Unauthorized');
		}
	}

	private extractToken(client: Socket): string {
		const authorization = client.handshake.headers.authorization;

		if (!authorization) {
			throw new WsException('Authorization header not found');
		}

		const [type, token] = authorization.split(' ');

		if (type !== 'Bearer') {
			throw new WsException('Invalid token type');
		}

		return token;
	}
} 