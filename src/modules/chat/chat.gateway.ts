import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

@WebSocketGateway({
	cors: true,
	namespace: 'chat',
	path: '/socket.io'
})
@UseGuards(WsJwtAuthGuard)
export class ChatGateway {
	constructor(private readonly chatService: ChatService) { }

	@SubscribeMessage('joinRoom')
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() chatRoomId: string
	) {
		const user = client.data.user;
		await this.chatService.getChatRoom(chatRoomId, user.id, user.role);
		client.join(chatRoomId);
	}

	@SubscribeMessage('sendMessage')
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { chatRoomId: string; content: string }
	) {
		const user = client.data.user;
		const message = await this.chatService.sendMessage(
			data.chatRoomId,
			user.id,
			data.content,
			user.role
		);

		client.to(data.chatRoomId).emit('newMessage', message);
		return message;
	}
} 