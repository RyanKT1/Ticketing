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
    findAll() {
        return this.deviceService.findAll();
    }
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.findOne(id); // return device[id]
    }

    @Post()
    create(@Body(ValidationPipe) createDeviceDto: CreateDeviceDto) {
        return this.deviceService.create(createDeviceDto);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto) {
        return this.deviceService.update(id, updateDeviceDto);
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.delete(id);
    }
}
