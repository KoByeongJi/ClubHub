import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationType,
} from '../../../events/entities/event.entity';
import { FileStorageService } from '../file-storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * 이메일 알림 전송 시뮬레이션
   * 실제 프로덕션에서는 nodemailer, SendGrid 등의 서비스를 사용
   */
  async sendEmailNotification(
    to: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
      console.log(`[EMAIL] Message: ${message}`);
      // 실제 이메일 전송 로직은 여기에 구현
      // await emailService.send({ to, subject, html: message });
      return true;
    } catch (error) {
      console.error('[EMAIL] Error:', error);
      return false;
    }
  }

  /**
   * SMS 알림 전송 시뮬레이션
   * 실제 프로덕션에서는 Twilio, AWS SNS 등의 서비스를 사용
   */
  async sendSmsNotification(
    phoneNumber: string,
    message: string,
  ): Promise<boolean> {
    try {
      console.log(`[SMS] Phone: ${phoneNumber}`);
      console.log(`[SMS] Message: ${message}`);
      // 실제 SMS 전송 로직은 여기에 구현
      // await smsService.send({ to: phoneNumber, body: message });
      return true;
    } catch (error) {
      console.error('[SMS] Error:', error);
      return false;
    }
  }

  /**
   * 푸시 알림 전송 시뮬레이션
   * 실제 프로덕션에서는 Firebase Cloud Messaging, OneSignal 등의 서비스를 사용
   */
  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
  ): Promise<boolean> {
    try {
      console.log(`[PUSH] User: ${userId}, Title: ${title}`);
      console.log(`[PUSH] Message: ${message}`);
      // 실제 푸시 알림 로직은 여기에 구현
      // await fcm.send({ to: userDeviceToken, notification: { title, body: message } });
      return true;
    } catch (error) {
      console.error('[PUSH] Error:', error);
      return false;
    }
  }

  /**
   * 알림 생성 및 저장
   */
  createNotification(
    eventId: string,
    userId: string,
    type: NotificationType,
    message: string,
  ): Notification {
    const notification: Notification = {
      id: uuidv4(),
      eventId,
      userId,
      type,
      message,
      status: 'pending',
      createdAt: new Date(),
    };

    this.fileStorageService.saveNotification(notification);
    return notification;
  }

  /**
   * 사용자에게 행사 전 알림 전송
   * 실제 프로덕션에서는 스케줄러(예: node-cron)를 사용하여 일정 시간에 자동 실행
   */
  async sendEventReminder(
    eventId: string,
    clubId: string,
    hoursBeforeEvent: number = 24,
  ): Promise<void> {
    const event = this.fileStorageService.getEventById(eventId);
    if (!event) {
      throw new Error('행사를 찾을 수 없습니다.');
    }

    // 동아리 멤버 조회
    const members = this.fileStorageService.getMembersByClubId(clubId);
    const approvedMembers = members.filter((m) => m.status === 'approved');

    // 각 멤버에게 알림 전송
    for (const member of approvedMembers) {
      const user = this.fileStorageService.getUserById(member.userId);
      if (!user) continue;

      const eventTime = new Date(event.startDate);
      const now = new Date();
      const timeDiff = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // 행사 시작 시간이 지정된 시간(기본 24시간) 전이면 알림 전송
      if (timeDiff <= hoursBeforeEvent && timeDiff > 0) {
        const message = `[${event.title}] 행사가 ${Math.round(timeDiff)}시간 후에 시작됩니다. 장소: ${event.location || '미정'}`;

        // 모든 채널로 알림 전송 (이메일, SMS, 푸시)
        const emailSent = await this.sendEmailNotification(
          user.email,
          `[행사 알림] ${event.title}`,
          message,
        );

        const pushSent = await this.sendPushNotification(
          member.userId,
          event.title,
          message,
        );

        // 알림 기록 저장
        this.createNotification(
          eventId,
          member.userId,
          NotificationType.EMAIL,
          message,
        );
        if (emailSent) {
          const notif = this.fileStorageService.getAllNotifications();
          const lastNotif = notif[notif.length - 1];
          this.fileStorageService.updateNotification(lastNotif.id, {
            status: 'sent',
            sentAt: new Date(),
          });
        }
      }
    }
  }

  /**
   * 사용자의 알림 목록 조회
   */
  getUserNotifications(userId: string): Notification[] {
    return this.fileStorageService.getNotificationsByUserId(userId);
  }

  /**
   * 알림 읽음 처리
   */
  markAsRead(notificationId: string): Notification | null {
    return this.fileStorageService.updateNotification(notificationId, {
      status: 'sent',
    });
  }
}
