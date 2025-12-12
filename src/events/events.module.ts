import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FileStorageService } from '../common/services/file-storage.service';
import { NotificationService } from '../common/services/notification/notification.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService, FileStorageService, NotificationService],
})
export class EventsModule {}
