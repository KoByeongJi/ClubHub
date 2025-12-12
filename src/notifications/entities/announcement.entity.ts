export enum AnnouncementType {
  GENERAL = 'general', // 일반 공지
  URGENT = 'urgent', // 긴급 공지
  EVENT = 'event', // 행사 공지
}

export class Announcement {
  id: string;
  clubId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isPinned: boolean; // 상단 고정 여부
  createdBy: string; // 회장 ID
  createdAt: Date;
  updatedAt: Date;
}
