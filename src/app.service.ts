import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Agora API',
      version: '1.0.0',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
        },
        orders: {
          create: 'POST /orders/new',
          list: 'GET /orders',
          getOne: 'GET /orders/:id',
          updateStatus: 'PATCH /orders/:id/status',
        },
        chat: {
          getRoom: 'GET /chat/:chatRoomId',
          sendMessage: 'POST /chat/:chatRoomId/messages',
          closeChat: 'POST /chat/:chatRoomId/close',
        },
        websocket: {
          connect: 'ws://localhost:3000/chat',
          events: {
            join: 'socket.emit("joinRoom", chatRoomId)',
            send: 'socket.emit("sendMessage", { chatRoomId, content })',
            receive: 'socket.on("newMessage", callback)',
          },
        },
      },
      docs: '/docs',
    };
  }
}
