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
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('club/:clubId/announcements')
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
  findAll(@Param('clubId') clubId: string) {
    return this.notificationsService.findAll(clubId);
  }

  @Get('club/:clubId/announcements/:announcementId')
  findOne(
    @Param('clubId') clubId: string,
    @Param('announcementId') announcementId: string,
  ) {
    return this.notificationsService.findOne(clubId, announcementId);
  }

  @Patch('club/:clubId/announcements/:announcementId')
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
