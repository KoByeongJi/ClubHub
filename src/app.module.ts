import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [AuthModule, UsersModule, ClubsModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
