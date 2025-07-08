import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, ValidationPipe, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { CreateDeviceDto } from './dto/create-device-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// uncomment this to remove throttler @SkipThrottle()

@Controller('devices')
export class DevicesController {
    //order of routes matter highest one ovverides lower ones
    //logic for getting devices will be stored in service and added here
    constructor(private readonly deviceService: DevicesService) {}
    // to remove throttler for this @SkipThrottle({ default: false })
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.deviceService.findAll();
    }
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    create(@Body(ValidationPipe) createDeviceDto: CreateDeviceDto) {
        return this.deviceService.create(createDeviceDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto) {
        return this.deviceService.update(id, updateDeviceDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.deviceService.delete(id);
    }
}
