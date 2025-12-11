import { MemberRole } from '../entities/member.entity';

export class ChangeMemberRoleDto {
  memberId: string;
  role: MemberRole;
}
