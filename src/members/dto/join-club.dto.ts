import { ApiProperty } from '@nestjs/swagger';

export class JoinClubDto {
  @ApiProperty({ description: '가입할 동아리 ID', example: 'c6c34c7c-...' })
  clubId: string;
}
