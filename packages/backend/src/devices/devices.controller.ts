import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Res, ValidationPipe, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { CreateDeviceDto } from './dto/create-device-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';

@Controller('devices')
export class DevicesController {
    constructor(private readonly deviceService: DevicesService) {}
    
    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Res() res: Response) {
        const response = await this.deviceService.findAll();
        return res.status(response.statusCode).json(response);
    }
    
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
        const response = await this.deviceService.findOne(id);
        return res.status(response.statusCode).json(response);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    async create(@Body(ValidationPipe) createDeviceDto: CreateDeviceDto, @Res() res: Response) {
        const response = await this.deviceService.create(createDeviceDto);
        return res.status(response.statusCode).json(response);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto,
        @Res() res: Response
    ) {
        const response = await this.deviceService.update(id, updateDeviceDto);
        return res.status(response.statusCode).json(response);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admins')
    async delete(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
        const response = await this.deviceService.delete(id);
        return res.status(response.statusCode).json(response);
    }
}
