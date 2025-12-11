export enum MemberRole {
  MEMBER = 'member',
  VICE_PRESIDENT = 'vice_president',
  MANAGER = 'manager',
}

export enum MemberStatus {
  PENDING = 'pending', // 가입 신청 대기
  APPROVED = 'approved', // 가입 승인
  REJECTED = 'rejected', // 가입 거절
}

export class Member {
  id: string;
  clubId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}
