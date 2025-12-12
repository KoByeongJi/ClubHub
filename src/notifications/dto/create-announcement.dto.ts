import { AnnouncementType } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  title: string;
  content: string;
  type: AnnouncementType;
  isPinned?: boolean;
}
