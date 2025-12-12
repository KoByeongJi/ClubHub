import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('clubs')
@ApiTags('Clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '동아리 생성 (관리자)' })
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClubDto: CreateClubDto, @Request() req) {
    const ownerId = req.user.sub;
    return this.clubsService.create(createClubDto, ownerId);
  }

  @Get()
  @ApiOperation({ summary: '동아리 목록 조회' })
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '동아리 상세 조회' })
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '동아리 수정 (회장)' })
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() updateClubDto: UpdateClubDto,
    @Request() req,
  ) {
    const requesterId = req.user.sub;
    return this.clubsService.update(id, updateClubDto, requesterId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '동아리 삭제 (회장)' })
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    const requesterId = req.user.sub;
    this.clubsService.remove(id, requesterId);
    return;
  }
}
