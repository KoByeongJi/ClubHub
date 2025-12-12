import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: '소프트웨어 연구회' })
  name: string;

  @ApiProperty({ example: '웹/모바일 프로젝트를 함께 하는 동아리' })
  description: string;
}
