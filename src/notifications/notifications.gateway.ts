import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // 연결된 사용자 목록에서 제거
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket.id === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.connectedUsers.set(userId, client);
    console.log(`User registered: ${userId} with socket ${client.id}`);
    return { event: 'registered', data: { userId, socketId: client.id } };
  }

  /**
   * 특정 사용자에게 알림 전송
   */
  sendToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      console.log(`Notification sent to user ${userId}:`, event, data);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }

  /**
   * 동아리 회원 전체에게 알림 전송
   */
  sendToClub(clubId: string, event: string, data: any) {
    this.server.emit(`club:${clubId}:${event}`, data);
    console.log(`Notification sent to club ${clubId}:`, event, data);
  }

  /**
   * 모든 연결된 클라이언트에게 브로드캐스트
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`Broadcast:`, event, data);
  }

  /**
   * 새 공지사항 알림
   */
  notifyNewAnnouncement(clubId: string, announcement: any) {
    this.sendToClub(clubId, 'new-announcement', {
      type: 'announcement',
      clubId,
      announcement,
      timestamp: new Date(),
    });
  }

  /**
   * 새 행사 알림
   */
  notifyNewEvent(clubId: string, event: any) {
    this.sendToClub(clubId, 'new-event', {
      type: 'event',
      clubId,
      event,
      timestamp: new Date(),
    });
  }

  /**
   * 행사 리마인더 알림
   */
  notifyEventReminder(clubId: string, event: any) {
    this.sendToClub(clubId, 'event-reminder', {
      type: 'reminder',
      clubId,
      event,
      timestamp: new Date(),
    });
  }
}
