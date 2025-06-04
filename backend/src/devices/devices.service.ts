import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { DevicesRepository } from './devices.repository';
import { Device } from './entity/device.entity';
@Injectable()
export class DevicesService {


    constructor(private readonly devicesRepository: DevicesRepository){

    }
     findAllDevices(){
        const result = this.devicesRepository.findAllDevices()
        return result
    }

    findOneDevice(id:string){
       return this.devicesRepository.findOneDevice(id)
    }
    createDevice(createDeviceDto:CreateDeviceDto){
        const newDevice = {
            ...createDeviceDto
        }
        return this.devicesRepository.upsertOneDevice(Device.createDeviceInstanceFromDeviceDto(newDevice))
    }
    async updateDevice(id:string,updateDeviceDto:UpdateDeviceDto){
       const existingDevice = await this.devicesRepository.findOneDevice(id)
       if(existingDevice){
            if(updateDeviceDto.name){
            existingDevice.name = updateDeviceDto.name
        }
            if(updateDeviceDto.manufacturer){
            existingDevice.manufacturer = updateDeviceDto.manufacturer
        }
            if(updateDeviceDto.model){
            existingDevice.model = updateDeviceDto.model
        }
            existingDevice.updatedAt = new Date()
            return this.devicesRepository.upsertOneDevice(existingDevice)
        }
        // return error about no id being found
       return false

       
        
    }
    deleteDevice(id:string){
        return this.devicesRepository.deleteOneDevice(id)
        
    }
}
