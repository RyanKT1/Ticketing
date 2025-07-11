import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { CreateDeviceDto } from './dto/create-device-dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';
import { ApiGatewayAuthGuard } from '../auth/guards/api-gateway-auth.guard';
import { createCorsResponse } from '../helpers/cors.helper';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @UseGuards(ApiGatewayAuthGuard)
  @Get()
  async findAll(@Res() res: Response): Promise<Response> {
    const response = await this.deviceService.findAll();
    return createCorsResponse(res, response.statusCode, response);
  }

  @Get(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<Response> {
    const response = await this.deviceService.findOne(id);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Post()
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles('Admins')
  async create(
    @Body(ValidationPipe) createDeviceDto: CreateDeviceDto,
    @Res() res: Response,
  ): Promise<Response> {
    const response = await this.deviceService.create(createDeviceDto);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Patch(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles('Admins')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDeviceDto: UpdateDeviceDto,
    @Res() res: Response,
  ): Promise<Response> {
    const response = await this.deviceService.update(id, updateDeviceDto);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles('Admins')
  async delete(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<Response> {
    const response = await this.deviceService.delete(id);
    return createCorsResponse(res, response.statusCode, response);
  }
}
