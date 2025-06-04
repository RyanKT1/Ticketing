import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';
import { DevicesModule } from './devices/devices.module';
import { DevicesRepository } from './devices/devices.repository';

@Module({
  imports: [UsersModule, DevicesModule],
  controllers: [AppController, DevicesController],
  providers: [AppService, DevicesService,DevicesRepository],
})
export class AppModule {}
