import { AnnouncementType } from '../entities/announcement.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ example: '정기 총회 안내 (변경)' })
  title?: string;

  @ApiPropertyOptional({ example: '장소가 2층으로 변경되었습니다.' })
  content?: string;

  @ApiPropertyOptional({ enum: AnnouncementType })
  type?: AnnouncementType;

  @ApiPropertyOptional({ example: false })
  isPinned?: boolean;
}
