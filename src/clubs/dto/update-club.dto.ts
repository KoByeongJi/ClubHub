import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClubDto {
  @ApiPropertyOptional({ example: '소프트웨어 연구회 (개정명)' })
  name?: string;

  @ApiPropertyOptional({ example: '프로젝트 + 스터디 진행' })
  description?: string;
}
