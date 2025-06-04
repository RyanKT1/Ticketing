import { CreateDeviceDto } from "../dto/create-device-dto"
import { v4 as uuidv4 } from 'uuid';

export class Device{
    id: string
    name: string
    model : string
    manufacturer : string 
    createdAt : Date
    updatedAt : Date
    
    static createDeviceInstanceFromDynamoDbObject(data:any):Device{
        const device = new Device()
        device.id = data.id?.S
        device.name = data.name?.S
        device.model = data.model?.S
        device.manufacturer = data.manufacturer?.S
        device.createdAt = data.createdAt?.S
        device.updatedAt = data.updatedAt?.S
        return device
    }

    static createDeviceInstanceFromDeviceDto(createDeviceDto:CreateDeviceDto){
        const device = new Device()
        device.id = uuidv4()
        device.name = createDeviceDto.name
        device.model = createDeviceDto.model
        device.manufacturer = createDeviceDto.manufacturer
        device.createdAt = new Date()
        device.updatedAt =  new Date()
        return device
    }
}