import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { DevicesModule } from './devices/devices.module';
import { DevicesRepository } from './devices/devices.repository';

//throttler is used for rate limiting to maximise the amount of requests that can be made in a minute
// short throttler means that no more than 3 requests per client in a second
@Module({
    imports: [
        DevicesModule,
        ThrottlerModule.forRoot([
            { name: 'short', ttl: 1000, limit: 3 },
            { name: 'long', ttl: 60000, limit: 100 },
        ]),
    ],
    controllers: [AppController, DevicesController],
    providers: [AppService, DevicesService, DevicesRepository, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
