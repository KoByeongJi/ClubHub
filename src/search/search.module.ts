import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, FileStorageService],
})
export class SearchModule {}
