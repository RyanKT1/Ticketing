import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { MessagesRepository } from './message.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TicketsModule, AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
