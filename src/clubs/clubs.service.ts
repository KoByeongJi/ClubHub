import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from '../common/services/file-storage.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entities/club.entity';

@Injectable()
export class ClubsService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  create(createClubDto: CreateClubDto, ownerId: string): Club {
    const newClub: Club = {
      id: uuidv4(),
      name: createClubDto.name,
      description: createClubDto.description,
      ownerId,
      createdAt: new Date(),
    };

    this.fileStorageService.saveClub(newClub);
    return newClub;
  }

  findAll(): Club[] {
    return this.fileStorageService.getAllClubs();
  }

  findOne(id: string): Club {
    const club = this.fileStorageService.getClubById(id);
    if (!club) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }
    return club;
  }

  update(id: string, updateClubDto: UpdateClubDto, requesterId: string): Club {
    const existing = this.fileStorageService.getClubById(id);
    if (!existing) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (existing.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 수정할 수 있습니다.');
    }

    const updated = this.fileStorageService.updateClub(id, {
      ...updateClubDto,
    });

    // updateClub returns null only if not found, already handled
    return updated as Club;
  }

  remove(id: string, requesterId: string): boolean {
    const existing = this.fileStorageService.getClubById(id);
    if (!existing) {
      throw new NotFoundException('동아리를 찾을 수 없습니다.');
    }

    if (existing.ownerId !== requesterId) {
      throw new ForbiddenException('회장만 삭제할 수 있습니다.');
    }

    return this.fileStorageService.deleteClub(id);
  }
}
