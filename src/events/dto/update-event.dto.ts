import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: '웹 개발 워크숍 (업데이트)' })
  title?: string;

  @ApiPropertyOptional({ example: 'React, Vue, Node.js 소개' })
  description?: string;

  @ApiPropertyOptional({ example: '2025-12-20T15:00:00Z', type: String })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2025-12-20T18:00:00Z', type: String })
  endDate?: Date;

  @ApiPropertyOptional({ example: '학생회관 2층 세미나실' })
  location?: string;

  @ApiPropertyOptional({ example: 40 })
  maxAttendees?: number;
}
