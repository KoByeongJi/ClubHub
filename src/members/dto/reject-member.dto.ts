import { ApiProperty } from '@nestjs/swagger';

export class RejectMemberDto {
  @ApiProperty({
    description: '거절할 회원 엔트리 ID',
    example: 'm1a2b3c4-...',
  })
  memberId: string;
}
