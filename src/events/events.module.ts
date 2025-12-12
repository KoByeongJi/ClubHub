import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FileStorageService } from '../common/services/file-storage.service';
import { NotificationService } from '../common/services/notification/notification.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, FileStorageService, NotificationService],
})
export class EventsModule {}
