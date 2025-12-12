import { AnnouncementType } from '../entities/announcement.entity';

export class UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  isPinned?: boolean;
}
