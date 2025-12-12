import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { FileStorageService } from '../common/services/file-storage.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, FileStorageService],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
