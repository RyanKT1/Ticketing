import { Injectable, Logger } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { DevicesRepository } from './devices.repository';
import { Device } from './entity/device.entity';
import { ResponseObject } from 'src/errors/exception-filter';

export enum ResponseStatus {
    Success = 'Success',
    Failure = 'Failure',
}
export interface ReturnType {
    status: ResponseStatus;
    result?: any; // should change it to handle Device and Device[]
    error?: ResponseObject;
}
/*
export const makeErrorResponse = (errorCode: number, errorMessage: string) => ({
    statusCode: errorCode,
    body: JSON.stringify({
        error: { message: errorMessage },
    }),
});
*/
export const makeSuccessResponse = (result?: any): ReturnType => ({
    status: ResponseStatus.Success,
    result: result,
});
@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);

    constructor(private readonly devicesRepository: DevicesRepository) {}

    async findAll(): Promise<ReturnType> {
        this.logger.log(`Retrieving all devices`);
        const devices = await this.devicesRepository.findAll();
        return makeSuccessResponse(devices);
    }

    async findOne(id: string): Promise<ReturnType> {
        this.logger.log(`Retrieving device with id: ${id}`);
        const device = await this.devicesRepository.findOne(id);

        return makeSuccessResponse(device);
    }
    create(createDeviceDto: CreateDeviceDto): ReturnType {
        this.logger.log(`Creating new device`);
        const newDevice = {
            ...createDeviceDto,
        };
        this.devicesRepository.upsertOneDevice(Device.createDeviceInstanceFromDeviceDto(newDevice));
        return makeSuccessResponse();
    }
    async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<ReturnType | undefined> {
        this.logger.log(`Updating device with id: ${id}`);
        const existingDevice = await this.devicesRepository.findOne(id);
        if (existingDevice) {
            if (updateDeviceDto.name) {
                existingDevice.name = updateDeviceDto.name;
            }
            if (updateDeviceDto.manufacturer) {
                existingDevice.manufacturer = updateDeviceDto.manufacturer;
            }
            if (updateDeviceDto.model) {
                existingDevice.model = updateDeviceDto.model;
            }
            existingDevice.updatedAt = new Date();
            this.devicesRepository.upsertOneDevice(existingDevice);
            return makeSuccessResponse();
        }
        // return error about no id being found
        this.logger.error(`Device with id: ${id} was not found.`);
        return undefined;
    }
    delete(id: string): ReturnType {
        this.logger.log(`Deleting device with id: ${id}`);
        this.devicesRepository.deleteOneDevice(id);
        return makeSuccessResponse();
    }
}
