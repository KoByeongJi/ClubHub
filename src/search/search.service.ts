import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileStorageService } from '../common/services/file-storage.service';
import { Club } from '../clubs/entities/club.entity';
import { Member } from '../members/entities/member.entity';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';

interface MemberWithUser {
  member: Member;
  user: User;
}

@Injectable()
export class SearchService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  searchClubs(query?: string): Club[] {
    const clubs = this.fileStorageService.getAllClubs();
    if (!query) {
      return clubs;
    }

    const keyword = query.toLowerCase();
    return clubs.filter((club) => {
      const name = club.name?.toLowerCase() || '';
      const description = club.description?.toLowerCase() || '';
      return name.includes(keyword) || description.includes(keyword);
    });
  }

  searchMembers(clubId: string, query?: string): MemberWithUser[] {
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    const members = this.fileStorageService.getMembersByClubId(clubId);
    const combined = members
      .map((member) => {
        const user = this.fileStorageService.getUserById(member.userId);
        if (!user) {
          return null;
        }
        return { member, user } as MemberWithUser;
      })
      .filter(Boolean) as MemberWithUser[];

    if (!query) {
      return combined;
    }

    const keyword = query.toLowerCase();
    return combined.filter(({ user }) => {
      const name = user.name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      return name.includes(keyword) || email.includes(keyword);
    });
  }

  filterEvents(clubId?: string, startDate?: string, endDate?: string): Event[] {
    const events = this.fileStorageService.getAllEvents();

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (startDate && isNaN(start?.getTime() ?? NaN)) {
      throw new BadRequestException('유효한 시작 날짜를 입력하세요.');
    }

    if (endDate && isNaN(end?.getTime() ?? NaN)) {
      throw new BadRequestException('유효한 종료 날짜를 입력하세요.');
    }

    if (start && end && start > end) {
      throw new BadRequestException(
        '시작 날짜가 종료 날짜보다 이후일 수 없습니다.',
      );
    }

    const filtered = events.filter((event) => {
      if (clubId && event.clubId !== clubId) {
        return false;
      }

      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      if (start && eventEnd < start) {
        return false;
      }

      if (end && eventStart > end) {
        return false;
      }

      return true;
    });

    return filtered.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }
}
