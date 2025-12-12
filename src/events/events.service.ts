import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from '../common/services/file-storage.service';
import { NotificationService } from '../common/services/notification/notification.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly notificationService: NotificationService,
  ) {}

  create(
    clubId: string,
    createEventDto: CreateEventDto,
    createdBy: string,
  ): Event {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== createdBy) {
      throw new ForbiddenException('회장만 행사를 등록할 수 있습니다.');
    }

    // 시간 유효성 검사
    if (
      new Date(createEventDto.startDate) >= new Date(createEventDto.endDate)
    ) {
      throw new BadRequestException('시작 시간이 종료 시간보다 빨아야 합니다.');
    }

    const newEvent: Event = {
      id: uuidv4(),
      clubId,
      title: createEventDto.title,
      description: createEventDto.description,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      location: createEventDto.location,
      maxAttendees: createEventDto.maxAttendees,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.fileStorageService.saveEvent(newEvent);
    return newEvent;
  }

  findAll(clubId: string): Event[] {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    return this.fileStorageService.getEventsByClubId(clubId);
  }

  findOne(clubId: string, eventId: string): Event {
    const event = this.fileStorageService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('행사를 찾을 수 없습니다.');
    }

    if (event.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    return event;
  }

  update(
    clubId: string,
    eventId: string,
    updateEventDto: UpdateEventDto,
    requesterId: string,
  ): Event {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 행사를 수정할 수 있습니다.');
    }

    // 행사 존재 여부 확인
    const event = this.fileStorageService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('행사를 찾을 수 없습니다.');
    }

    if (event.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    // 시간 유효성 검사
    const startDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : event.startDate;
    const endDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : event.endDate;

    if (startDate >= endDate) {
      throw new BadRequestException('시작 시간이 종료 시간보다 빨아야 합니다.');
    }

    const updated = this.fileStorageService.updateEvent(eventId, {
      ...updateEventDto,
      startDate,
      endDate,
    });

    return updated as Event;
  }

  remove(clubId: string, eventId: string, requesterId: string): void {
    // 동아리 존재 여부 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    // 회장 여부 확인
    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 행사를 삭제할 수 있습니다.');
    }

    // 행사 존재 여부 확인
    const event = this.fileStorageService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('행사를 찾을 수 없습니다.');
    }

    if (event.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    this.fileStorageService.deleteEvent(eventId);
  }

  /**
   * 행사 알림 전송 (수동)
   * 실제로는 스케줄러로 자동 실행
   */
  async sendReminder(
    clubId: string,
    eventId: string,
    requesterId: string,
  ): Promise<void> {
    // 동아리 존재 여부 및 회장 확인
    const club = this.fileStorageService.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (club.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 알림을 전송할 수 있습니다.');
    }

    // 행사 존재 여부 확인
    const event = this.fileStorageService.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('행사를 찾을 수 없습니다.');
    }

    if (event.clubId !== clubId) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }

    await this.notificationService.sendEventReminder(eventId, clubId, 24);
  }
}
