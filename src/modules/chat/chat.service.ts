import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(private readonly prisma: PrismaService) { }

	async sendMessage(
		chatRoomId: string,
		userId: string,
		content: string,
		userRole: UserRole
	) {
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: { id: chatRoomId },
			include: { order: true }
		});

		if (chatRoom.isClosed) {
			throw new ForbiddenException('Cannot send message to closed chat room');
		}

		if (!chatRoom) {
			throw new NotFoundException('Chat room not found');
		}

		// Check access rights
		if (userRole !== UserRole.ADMIN && chatRoom.order.userId !== userId) {
			throw new ForbiddenException('Not authorized to access this chat room');
		}

		return this.prisma.message.create({
			data: {
				content,
				userId,
				chatRoomId
			},
			include: {
				user: true
			}
		});
	}

	async closeChat(
		chatRoomId: string,
		userId: string,
		summary: string,
		userRole: UserRole
	) {
		if (userRole !== UserRole.ADMIN) {
			throw new ForbiddenException('Only admins can close chat rooms');
		}

		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: { id: chatRoomId }
		});

		if (!chatRoom) {
			throw new NotFoundException('Chat room not found');
		}

		if (chatRoom.isClosed) {
			throw new ForbiddenException('Chat room is already closed');
		}

		return this.prisma.chatRoom.update({
			where: { id: chatRoomId },
			data: {
				isClosed: true,
				summary
			},
			include: {
				messages: {
					include: {
						user: true
					},
					orderBy: {
						createdAt: 'asc'
					}
				}
			}
		});
	}

	async getChatRoom(chatRoomId: string, userId: string, userRole: UserRole) {
		const chatRoom = await this.prisma.chatRoom.findUnique({
			where: { id: chatRoomId },
			include: {
				order: true,
				messages: {
					include: {
						user: true
					},
					orderBy: {
						createdAt: 'asc'
					}
				}
			}
		});

		if (!chatRoom) {
			throw new NotFoundException('Chat room not found');
		}

		if (userRole !== UserRole.ADMIN && chatRoom.order.userId !== userId) {
			throw new ForbiddenException('Not authorized to access this chat room');
		}

		return chatRoom;
	}
} 