import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':chatRoomId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message in chat room' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Hello, how can I help?' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
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
  @ApiOperation({ summary: 'Close a chat room (Admin only)' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room identifier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', example: 'Issue resolved' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Chat closed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
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
  @ApiOperation({ summary: 'Get chat room details and messages' })
  @ApiParam({ name: 'chatRoomId', description: 'Chat room identifier' })
  @ApiResponse({
    status: 200,
    description: 'Returns chat room with messages',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              senderId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getChatRoom(
    @Param('chatRoomId') chatRoomId: string,
    @User() user: { id: string; role: UserRole }
  ) {
    return this.chatService.getChatRoom(chatRoomId, user.id, user.role);
  }
}
