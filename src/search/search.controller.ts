import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Club } from '../clubs/entities/club.entity';
import { Event } from '../events/entities/event.entity';
import { Member } from '../members/entities/member.entity';
import { User } from '../users/entities/user.entity';

interface MemberResult {
  member: Member;
  user: User;
}

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('clubs')
  @ApiOperation({ summary: '동아리 검색 (키워드)' })
  searchClubs(@Query('q') query?: string): Club[] {
    return this.searchService.searchClubs(query);
  }

  @Get('clubs/:clubId/members')
  @ApiOperation({ summary: '동아리 회원 검색 (이름/이메일)' })
  searchMembers(
    @Param('clubId') clubId: string,
    @Query('q') query?: string,
  ): MemberResult[] {
    return this.searchService.searchMembers(clubId, query);
  }

  @Get('events')
  @ApiOperation({ summary: '일정 필터링 (기간/클럽)' })
  filterEvents(
    @Query('clubId') clubId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Event[] {
    return this.searchService.filterEvents(clubId, startDate, endDate);
  }
}
