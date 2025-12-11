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
import { JoinClubDto } from './dto/join-club.dto';
import { ApproveMemberDto } from './dto/approve-member.dto';
import { RejectMemberDto } from './dto/reject-member.dto';
import { ChangeMemberRoleDto } from './dto/change-member-role.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('join')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  joinClub(@Body() joinClubDto: JoinClubDto, @Request() req) {
    const userId = req.user.sub;
    return this.membersService.joinClub(joinClubDto, userId);
  }

  @Get('club/:clubId')
  getClubMembers(@Param('clubId') clubId: string) {
    return this.membersService.getClubMembers(clubId);
  }

  @Get('club/:clubId/pending')
  @UseGuards(JwtGuard)
  getPendingRequests(@Param('clubId') clubId: string, @Request() req) {
    const requesterId = req.user.sub;
    return this.membersService.getPendingRequests(clubId, requesterId);
  }

  @Post('club/:clubId/approve')
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
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveClub(@Param('clubId') clubId: string, @Request() req) {
    const userId = req.user.sub;
    this.membersService.leaveClub(clubId, userId);
    return;
  }

  @Delete('club/:clubId/remove/:memberId')
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
