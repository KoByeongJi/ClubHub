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
import { EventsService } from './events.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('club/:clubId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '행사 생성 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('clubId') clubId: string,
    @Body() createEventDto: CreateEventDto,
    @Request() req,
  ) {
    const createdBy = req.user.sub;
    return this.eventsService.create(clubId, createEventDto, createdBy);
  }

  @Get('club/:clubId')
  @ApiOperation({ summary: '행사 목록 조회' })
  findAll(@Param('clubId') clubId: string) {
    return this.eventsService.findAll(clubId);
  }

  @Get('club/:clubId/:eventId')
  @ApiOperation({ summary: '행사 상세 조회' })
  findOne(@Param('clubId') clubId: string, @Param('eventId') eventId: string) {
    return this.eventsService.findOne(clubId, eventId);
  }

  @Patch('club/:clubId/:eventId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '행사 수정 (회장)' })
  @UseGuards(JwtGuard)
  update(
    @Param('clubId') clubId: string,
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.eventsService.update(
      clubId,
      eventId,
      updateEventDto,
      requesterId,
    );
  }

  @Delete('club/:clubId/:eventId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '행사 삭제 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('clubId') clubId: string,
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    this.eventsService.remove(clubId, eventId, requesterId);
    return;
  }

  @Post('club/:clubId/:eventId/remind')
  @ApiBearerAuth()
  @ApiOperation({ summary: '행사 알림 전송 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async sendReminder(
    @Param('clubId') clubId: string,
    @Param('eventId') eventId: string,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    await this.eventsService.sendReminder(clubId, eventId, requesterId);
    return { message: '행사 알림이 전송되었습니다.' };
  }
}
