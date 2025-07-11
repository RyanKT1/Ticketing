import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { DevicesModule } from './devices/devices.module';
import { DevicesRepository } from './devices/devices.repository';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { TicketsRepository } from './tickets/tickets.repository';
import { AuthModule } from './auth/auth.module';
import { MessagesService } from './messages/messages.service';
import { MessagesRepository } from './messages/message.repository';
import { ApiGatewayAuthGuard } from './auth/guards/api-gateway-auth.guard';

// throttler is used for rate limiting to maximise the amount of requests that can be made in a minute
// short throttler means that no more than 3 requests per client in a second
@Module({
  imports: [
    DevicesModule,
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    TicketsModule,
    AuthModule,
    MessagesModule,
  ],
  controllers: [DevicesController, TicketsController],
  providers: [
    DevicesService,
    DevicesRepository,
    TicketsService,
    TicketsRepository,
    MessagesService,
    MessagesRepository,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: ApiGatewayAuthGuard },
  ],
})
export class AppModule {}
