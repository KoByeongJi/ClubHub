import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JoinClubDto } from './dto/join-club.dto';
import { ApproveMemberDto } from './dto/approve-member.dto';
import { RejectMemberDto } from './dto/reject-member.dto';
import { ChangeMemberRoleDto } from './dto/change-member-role.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('members')
@ApiTags('Members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('join')
  @ApiBearerAuth()
  @ApiOperation({ summary: '동아리 가입 신청 (회원)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  joinClub(@Body() joinClubDto: JoinClubDto, @Request() req) {
    const userId = req.user.sub;
    return this.membersService.joinClub(joinClubDto, userId);
  }

  @Get('club/:clubId')
  @ApiOperation({ summary: '동아리 회원 목록 조회' })
  getClubMembers(@Param('clubId') clubId: string) {
    return this.membersService.getClubMembers(clubId);
  }

  @Get('club/:clubId/pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: '가입 신청 목록 조회 (회장)' })
  @UseGuards(JwtGuard)
  getPendingRequests(@Param('clubId') clubId: string, @Request() req) {
    const requesterId = req.user.sub;
    return this.membersService.getPendingRequests(clubId, requesterId);
  }

  @Post('club/:clubId/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '가입 승인 (회장)' })
  @UseGuards(JwtGuard)
  approveMember(
    @Param('clubId') clubId: string,
    @Body() approveMemberDto: ApproveMemberDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.membersService.approveMember(
      clubId,
      approveMemberDto,
      requesterId,
    );
  }

  @Post('club/:clubId/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '가입 거절 (회장)' })
  @UseGuards(JwtGuard)
  rejectMember(
    @Param('clubId') clubId: string,
    @Body() rejectMemberDto: RejectMemberDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.membersService.rejectMember(
      clubId,
      rejectMemberDto,
      requesterId,
    );
  }

  @Delete('club/:clubId/leave')
  @ApiBearerAuth()
  @ApiOperation({ summary: '동아리 탈퇴 (본인)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveClub(@Param('clubId') clubId: string, @Request() req) {
    const userId = req.user.sub;
    this.membersService.leaveClub(clubId, userId);
    return;
  }

  @Delete('club/:clubId/remove/:memberId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 강제 탈퇴 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    this.membersService.removeMember(clubId, memberId, requesterId);
    return;
  }

  @Patch('club/:clubId/role/:memberId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 권한 변경 (회장)' })
  @UseGuards(JwtGuard)
  changeMemberRole(
    @Param('clubId') clubId: string,
    @Param('memberId') memberId: string,
    @Body() changeMemberRoleDto: ChangeMemberRoleDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.membersService.changeMemberRole(
      clubId,
      { ...changeMemberRoleDto, memberId },
      requesterId,
    );
  }
}
