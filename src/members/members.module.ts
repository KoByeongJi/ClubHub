import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService, FileStorageService],
})
export class MembersModule {}
