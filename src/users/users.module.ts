import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
  providers: [UsersService, FileStorageService],
  exports: [UsersService],
})
export class UsersModule {}
