import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { CreateDeviceDto } from './dto/create-device-dto';

// uncomment this to remove throttler @SkipThrottle()

@Controller('devices')
export class DevicesController {
    //order of routes matter highest one ovverides lower ones
    //logic for getting devices will be stored in service and added here
    constructor(private readonly deviceService: DevicesService) {}
    // to remove throttler for this @SkipThrottle({ default: false })
    @Get()
    findAllDevices() {
        return this.deviceService.findAllDevices();
    }
    @Get(':id')
    findOneDevice(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.findOneDevice(id); // return device[id]
    }

    @Post()
    createDevice(@Body(ValidationPipe) createDeviceDto: CreateDeviceDto) {
        return this.deviceService.createDevice(createDeviceDto);
    }

    @Patch(':id')
    updateDevice(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto) {
        return this.deviceService.updateDevice(id, updateDeviceDto);
    }

    @Delete(':id')
    deleteDevice(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.deleteDevice(id);
    }
}
