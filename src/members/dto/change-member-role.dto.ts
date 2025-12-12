import { MemberRole } from '../entities/member.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeMemberRoleDto {
  @ApiProperty({ description: '대상 회원 엔트리 ID', example: 'm1a2b3c4-...' })
  memberId: string;

  @ApiProperty({ enum: MemberRole, example: MemberRole.MANAGER })
  role: MemberRole;
}
