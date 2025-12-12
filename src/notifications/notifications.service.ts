import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from '../common/services/file-storage.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  create(
    clubId: string,
    createAnnouncementDto: CreateAnnouncementDto,
    createdBy: string,
  ): Announcement {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== createdBy) {
      throw new ForbiddenException('회장만 공지사항을 등록할 수 있습니다.');
    }

    const newAnnouncement: Announcement = {
      id: uuidv4(),
      clubId,
      title: createAnnouncementDto.title,
      content: createAnnouncementDto.content,
      type: createAnnouncementDto.type,
      isPinned: createAnnouncementDto.isPinned || false,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.fileStorageService.saveAnnouncement(newAnnouncement);

    // WebSocket으로 실시간 알림 전송
    this.notificationsGateway.notifyNewAnnouncement(clubId, newAnnouncement);

    return newAnnouncement;
  }

  findAll(clubId: string): Announcement[] {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    const announcements =
      this.fileStorageService.getAnnouncementsByClubId(clubId);

    // 고정된 공지가 먼저 오도록 정렬
    return announcements.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  findOne(clubId: string, announcementId: string): Announcement {
    const announcement =
      this.fileStorageService.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    if (announcement.clubId !== clubId) {
      throw new ForbiddenException('올바르지 않은 요청입니다.');
    }

    return announcement;
  }

  update(
    clubId: string,
    announcementId: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
    requesterId: string,
  ): Announcement {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 공지사항을 수정할 수 있습니다.');
    }

    // 공지사항 존재 여부 확인
    const announcement =
      this.fileStorageService.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    if (announcement.clubId !== clubId) {
      throw new ForbiddenException('올바르지 않은 요청입니다.');
    }

    const updated = this.fileStorageService.updateAnnouncement(
      announcementId,
      updateAnnouncementDto,
    );

    return updated as Announcement;
  }

  remove(clubId: string, announcementId: string, requesterId: string): void {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 공지사항을 삭제할 수 있습니다.');
    }

    // 공지사항 존재 여부 확인
    const announcement =
      this.fileStorageService.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    if (announcement.clubId !== clubId) {
      throw new ForbiddenException('올바르지 않은 요청입니다.');
    }

    this.fileStorageService.deleteAnnouncement(announcementId);
  }
}
