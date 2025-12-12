import { ApiProperty } from '@nestjs/swagger';

export class ApproveMemberDto {
  @ApiProperty({
    description: '승인할 회원 엔트리 ID',
    example: 'm1a2b3c4-...',
  })
  memberId: string;
}
