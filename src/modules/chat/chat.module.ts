import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/utils/env';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({
			secret: env.JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
	],
	providers: [ChatService, ChatGateway],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule { } 