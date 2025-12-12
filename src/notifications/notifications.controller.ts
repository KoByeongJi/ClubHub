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
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('club/:clubId/announcements')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지 생성 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('clubId') clubId: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @Request() req,
  ) {
    const createdBy = req.user.sub;
    return this.notificationsService.create(
      clubId,
      createAnnouncementDto,
      createdBy,
    );
  }

  @Get('club/:clubId/announcements')
  @ApiOperation({ summary: '공지 목록 조회' })
  findAll(@Param('clubId') clubId: string) {
    return this.notificationsService.findAll(clubId);
  }

  @Get('club/:clubId/announcements/:announcementId')
  @ApiOperation({ summary: '공지 상세 조회' })
  findOne(
    @Param('clubId') clubId: string,
    @Param('announcementId') announcementId: string,
  ) {
    return this.notificationsService.findOne(clubId, announcementId);
  }

  @Patch('club/:clubId/announcements/:announcementId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지 수정 (회장)' })
  @UseGuards(JwtGuard)
  update(
    @Param('clubId') clubId: string,
    @Param('announcementId') announcementId: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.notificationsService.update(
      clubId,
      announcementId,
      updateAnnouncementDto,
      requesterId,
    );
  }

  @Delete('club/:clubId/announcements/:announcementId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지 삭제 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('clubId') clubId: string,
    @Param('announcementId') announcementId: string,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    this.notificationsService.remove(clubId, announcementId, requesterId);
    return;
  }
}
