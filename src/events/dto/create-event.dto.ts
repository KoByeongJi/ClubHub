import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: '웹 개발 워크숍' })
  title: string;

  @ApiProperty({ example: 'React와 Node.js 기초' })
  description: string;

  @ApiProperty({ example: '2025-12-20T14:00:00Z', type: String })
  startDate: Date;

  @ApiProperty({ example: '2025-12-20T17:00:00Z', type: String })
  endDate: Date;

  @ApiPropertyOptional({ example: '학생회관 3층 세미나실' })
  location?: string;

  @ApiPropertyOptional({ example: 30 })
  maxAttendees?: number;
}
