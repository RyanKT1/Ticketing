import { Injectable, Logger } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { DevicesRepository } from './devices.repository';
import { Device } from './entity/device.entity';
import { 
  makeSuccessResponse, 
  makeErrorResponse, 
  SuccessResponse, 
  ErrorResponse, 
  ErrorCode,
  ErrorTypes,
  HttpStatus
} from '../helpers/response.helpers';

@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);

    constructor(private readonly devicesRepository: DevicesRepository) {}

    async findAll(): Promise<SuccessResponse | ErrorResponse> {
        try {
            this.logger.log(`Retrieving all devices`);
            const devices = await this.devicesRepository.findAll();
            return makeSuccessResponse(devices);
        } catch (error) {
            this.logger.error(`Failed to retrieve devices: ${error.message}`);
            return makeErrorResponse(
                ErrorTypes[ErrorCode.DATABASE_ERROR],
                'Failed to retrieve devices'
            );
        }
    }

    async findOne(id: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            this.logger.log(`Retrieving device with id: ${id}`);
            const device = await this.devicesRepository.findOne(id);
            
            if (!device) {
                this.logger.error(`Device with id: ${id} was not found.`);
                return makeErrorResponse(
                    ErrorTypes[ErrorCode.NOT_FOUND],
                    `Device with id: ${id} was not found`
                );
            }

            return makeSuccessResponse(device);
        } catch (error) {
            this.logger.error(`Failed to retrieve device: ${error.message}`);
            return makeErrorResponse(
                ErrorTypes[ErrorCode.DATABASE_ERROR],
                'Failed to retrieve device'
            );
        }
    }
    
    async create(createDeviceDto: CreateDeviceDto): Promise<SuccessResponse | ErrorResponse> {
        try {
            this.logger.log(`Creating new device`);
            const newDevice = {
                ...createDeviceDto,
            };
            await this.devicesRepository.upsertOneDevice(Device.createDeviceInstanceFromDeviceDto(newDevice));
            return makeSuccessResponse(null, HttpStatus.CREATED);
        } catch (error) {
            this.logger.error(`Failed to create device: ${error.message}`);
            return makeErrorResponse(
                ErrorTypes[ErrorCode.DATABASE_ERROR],
                'Failed to create device'
            );
        }
    }
    
    async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<SuccessResponse | ErrorResponse> {
        try {
            this.logger.log(`Updating device with id: ${id}`);
            const existingDevice = await this.devicesRepository.findOne(id);
            
            if (!existingDevice) {
                this.logger.error(`Device with id: ${id} was not found.`);
                return makeErrorResponse(
                    ErrorTypes[ErrorCode.NOT_FOUND],
                    `Device with id: ${id} was not found`
                );
            }
            
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
            
            await this.devicesRepository.upsertOneDevice(existingDevice);
            return makeSuccessResponse();
        } catch (error) {
            this.logger.error(`Failed to update device: ${error.message}`);
            return makeErrorResponse(
                ErrorTypes[ErrorCode.DATABASE_ERROR],
                'Failed to update device'
            );
        }
    }
    
    async delete(id: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            this.logger.log(`Deleting device with id: ${id}`);
            
            const existingDevice = await this.devicesRepository.findOne(id);
            if (!existingDevice) {
                this.logger.error(`Device with id: ${id} was not found.`);
                return makeErrorResponse(
                    ErrorTypes[ErrorCode.NOT_FOUND],
                    `Device with id: ${id} was not found`
                );
            }
            
            await this.devicesRepository.deleteOneDevice(id);
            return makeSuccessResponse();
        } catch (error) {
            this.logger.error(`Failed to delete device: ${error.message}`);
            return makeErrorResponse(
                ErrorTypes[ErrorCode.DATABASE_ERROR],
                'Failed to delete device'
            );
        }
    }
}
