import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query,ValidationPipe } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { CreateDeviceDto } from './dto/create-device-dto';

@Controller('devices')
export class DevicesController {
    //order of routes matter highest one ovverides lower ones
    //logic for getting devices will be stored in service and added here
    constructor(private readonly deviceService:DevicesService){}
    @Get() //
    async findAllDevices(@Query('idkfornow') idkfornow?: 'couldbe'|'orthis'|'idk'){
         const result = await this.deviceService.findAllDevices()
        return { yo: "hello123", result: result }// return all devices
    }
    @Get(':id')
    async findOneDevice(@Param('id',ParseUUIDPipe) id:string){

        return {result: await this.deviceService.findOneDevice(id)} // return device[id]
    }

    @Post()
    createDevice(@Body(ValidationPipe) createDeviceDto:CreateDeviceDto){
        return this.deviceService.createDevice(createDeviceDto)
    }

    @Patch(':id')
    async updateDevice(@Param('id',ParseUUIDPipe) id:string, @Body(ValidationPipe)updateDeviceDto:UpdateDeviceDto){
        console.log(id)
        console.log("the")
        return await this.deviceService.updateDevice(id,updateDeviceDto)

    }

    @Delete(':id')
    async deleteDevice(@Param('id',ParseUUIDPipe) id: string){
        return {
            result:this.deviceService.deleteDevice(id)
        } // return device[id]
    }
}
