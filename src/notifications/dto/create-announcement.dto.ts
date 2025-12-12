import { AnnouncementType } from '../entities/announcement.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: '정기 총회 안내' })
  title: string;

  @ApiProperty({ example: '12/20(금) 19:00 학생회관 3층' })
  content: string;

  @ApiProperty({ enum: AnnouncementType, example: AnnouncementType.GENERAL })
  type: AnnouncementType;

  @ApiPropertyOptional({ example: true })
  isPinned?: boolean;
}
