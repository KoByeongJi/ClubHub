import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Club } from '../clubs/entities/club.entity';
import { Event } from '../events/entities/event.entity';
import { Member } from '../members/entities/member.entity';
import { User } from '../users/entities/user.entity';

interface MemberResult {
  member: Member;
  user: User;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('clubs')
  searchClubs(@Query('q') query?: string): Club[] {
    return this.searchService.searchClubs(query);
  }

  @Get('clubs/:clubId/members')
  searchMembers(
    @Param('clubId') clubId: string,
    @Query('q') query?: string,
  ): MemberResult[] {
    return this.searchService.searchMembers(clubId, query);
  }

  @Get('events')
  filterEvents(
    @Query('clubId') clubId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Event[] {
    return this.searchService.filterEvents(clubId, startDate, endDate);
  }
}
