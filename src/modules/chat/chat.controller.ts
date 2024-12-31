import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UseGuards,
	HttpStatus,
	HttpCode
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Post(':chatRoomId/messages')
	@HttpCode(HttpStatus.CREATED)
	async sendMessage(
		@Param('chatRoomId') chatRoomId: string,
		@User() user: { id: string; role: UserRole },
		@Body() body: { content: string }
	) {
		return this.chatService.sendMessage(
			chatRoomId,
			user.id,
			body.content,
			user.role
		);
	}

	@Post(':chatRoomId/close')
	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	async closeChat(
		@Param('chatRoomId') chatRoomId: string,
		@User() user: { id: string; role: UserRole },
		@Body() body: { summary: string }
	) {
		return this.chatService.closeChat(
			chatRoomId,
			user.id,
			body.summary,
			user.role
		);
	}

	@Get(':chatRoomId')
	@HttpCode(HttpStatus.OK)
	async getChatRoom(
		@Param('chatRoomId') chatRoomId: string,
		@User() user: { id: string; role: UserRole }
	) {
		return this.chatService.getChatRoom(chatRoomId, user.id, user.role);
	}
} 