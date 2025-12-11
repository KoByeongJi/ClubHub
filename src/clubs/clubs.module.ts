import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, FileStorageService],
})
export class ClubsModule {}
