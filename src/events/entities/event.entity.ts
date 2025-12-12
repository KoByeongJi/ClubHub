export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export class Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  maxAttendees?: number;
  createdBy: string; // 회장 ID
  createdAt: Date;
  updatedAt: Date;
}

export class Notification {
  id: string;
  eventId: string;
  userId: string;
  type: NotificationType;
  message: string;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}
