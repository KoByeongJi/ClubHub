import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from '../common/services/file-storage.service';
import { Member, MemberRole, MemberStatus } from './entities/member.entity';
import { JoinClubDto } from './dto/join-club.dto';
import { ApproveMemberDto } from './dto/approve-member.dto';
import { RejectMemberDto } from './dto/reject-member.dto';
import { ChangeMemberRoleDto } from './dto/change-member-role.dto';

@Injectable()
export class MembersService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  joinClub(joinClubDto: JoinClubDto, userId: string): Member {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(joinClubDto.clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 이미 가입 신청했는지 확인
    const existingMember = this.fileStorageService.getMemberByUserAndClub(
      userId,
      joinClubDto.clubId,
    );
    if (existingMember) {
      throw new ConflictException('이미 가입 신청하였습니다.');
    }

    // 새로운 가입 신청 생성
    const newMember: Member = {
      id: uuidv4(),
      clubId: joinClubDto.clubId,
      userId,
      role: MemberRole.MEMBER,
      status: MemberStatus.PENDING,
      requestedAt: new Date(),
    };

    this.fileStorageService.saveMember(newMember);
    return newMember;
  }

  getClubMembers(clubId: string): Member[] {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    return this.fileStorageService.getMembersByClubId(clubId);
  }

  getPendingRequests(clubId: string, requesterId: string): Member[] {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 가입 신청 목록을 볼 수 있습니다.');
    }

    const members = this.fileStorageService.getMembersByClubId(clubId);
    return members.filter((member) => member.status === MemberStatus.PENDING);
  }

  approveMember(
    clubId: string,
    approveMemberDto: ApproveMemberDto,
    requesterId: string,
  ): Member {
    // 동아리 존재 여부 및 회장 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 가입을 승인할 수 있습니다.');
    }

    // 멤버 존재 여부 및 상태 확인
    const member = this.fileStorageService.getMemberById(
      approveMemberDto.memberId,
    );
    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    if (member.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    if (member.status !== MemberStatus.PENDING) {
      throw new BadRequestException(
        '승인 대기 중인 멤버만 승인할 수 있습니다.',
      );
    }

    // 멤버 승인
    const updated = this.fileStorageService.updateMember(
      approveMemberDto.memberId,
      {
        status: MemberStatus.APPROVED,
        approvedAt: new Date(),
      },
    );

    return updated as Member;
  }

  rejectMember(
    clubId: string,
    rejectMemberDto: RejectMemberDto,
    requesterId: string,
  ): Member {
    // 동아리 존재 여부 및 회장 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 가입을 거절할 수 있습니다.');
    }

    // 멤버 존재 여부 및 상태 확인
    const member = this.fileStorageService.getMemberById(
      rejectMemberDto.memberId,
    );
    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    if (member.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    if (member.status !== MemberStatus.PENDING) {
      throw new BadRequestException(
        '승인 대기 중인 멤버만 거절할 수 있습니다.',
      );
    }

    // 멤버 거절
    const updated = this.fileStorageService.updateMember(
      rejectMemberDto.memberId,
      {
        status: MemberStatus.REJECTED,
        rejectedAt: new Date(),
      },
    );

    return updated as Member;
  }

  leaveClub(clubId: string, userId: string): void {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장은 탈퇴할 수 없음
    if (club.ownerId === userId) {
      throw new ForbiddenException('회장은 동아리를 탈퇴할 수 없습니다.');
    }

    // 멤버 찾기
    const member = this.fileStorageService.getMemberByUserAndClub(
      userId,
      clubId,
    );
    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    // 멤버 삭제
    this.fileStorageService.deleteMember(member.id);
  }

  removeMember(clubId: string, memberId: string, requesterId: string): void {
    // 동아리 존재 여부 및 회장 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 멤버를 강제 탈퇴할 수 있습니다.');
    }

    // 멤버 존재 여부 확인
    const member = this.fileStorageService.getMemberById(memberId);
    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    if (member.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    // 멤버 삭제
    this.fileStorageService.deleteMember(memberId);
  }

  changeMemberRole(
    clubId: string,
    changeMemberRoleDto: ChangeMemberRoleDto,
    requesterId: string,
  ): Member {
    // 동아리 존재 여부 및 회장 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 권한을 변경할 수 있습니다.');
    }

    // 멤버 존재 여부 확인
    const member = this.fileStorageService.getMemberById(
      changeMemberRoleDto.memberId,
    );
    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    if (member.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    // 권한 변경
    const updated = this.fileStorageService.updateMember(
      changeMemberRoleDto.memberId,
      {
        role: changeMemberRoleDto.role,
      },
    );

    return updated as Member;
  }
}
