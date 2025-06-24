import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService, ResponseStatus, makeSuccessResponse } from './devices.service';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { BadRequestException, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';

describe('DevicesController', () => {
    let controller: DevicesController;
    let service: DevicesService;

    const mockDevicesService = {
        findAllDevices: jest.fn(),
        findOneDevice: jest.fn(),
        createDevice: jest.fn(),
        updateDevice: jest.fn(),
        deleteDevice: jest.fn(),
    };

    const mockDevice = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Device',
        model: 'Test Model',
        manufacturer: 'Test Manufacturer',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DevicesController],
            providers: [
                {
                    provide: DevicesService,
                    useValue: mockDevicesService,
                },
            ],
        }).compile();

        controller = module.get<DevicesController>(DevicesController);
        service = module.get<DevicesService>(DevicesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAllDevices', () => {
        describe('when service returns devices', () => {
            it('should return an array of devices with success status', async () => {
                const devices = [mockDevice];
                const expectedResponse = makeSuccessResponse(devices);
                mockDevicesService.findAllDevices.mockResolvedValue(expectedResponse);

                const result = await controller.findAllDevices();

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.findAllDevices).toHaveBeenCalled();
            });
        });

        describe('when service returns an empty array', () => {
            it('should return an empty array with success status', async () => {
                const expectedResponse = makeSuccessResponse([]);
                mockDevicesService.findAllDevices.mockResolvedValue(expectedResponse);

                const result = await controller.findAllDevices();

                expect(result).toEqual(expectedResponse);
                expect(result.status).toBe(ResponseStatus.Success);
                expect(result.result).toEqual([]);
            });
        });

        describe('when service throws an error', () => {
            it('should propagate the error', async () => {
                const error = new Error('Service error');
                mockDevicesService.findAllDevices.mockRejectedValue(error);

                await expect(controller.findAllDevices()).rejects.toThrow('Service error');
            });
        });
    });

    describe('findOneDevice', () => {
        describe('when device exists', () => {
            it('should return the device with success status', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const expectedResponse = makeSuccessResponse(mockDevice);
                mockDevicesService.findOneDevice.mockResolvedValue(expectedResponse);

                const result = await controller.findOneDevice(deviceId);

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.findOneDevice).toHaveBeenCalledWith(deviceId);
            });
        });

        describe('when device does not exist', () => {
            it('should return success status with undefined result', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const expectedResponse = makeSuccessResponse(undefined);
                mockDevicesService.findOneDevice.mockResolvedValue(expectedResponse);

                const result = await controller.findOneDevice(deviceId);

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.findOneDevice).toHaveBeenCalledWith(deviceId);
            });
        });

        describe('when invalid UUID is provided', () => {
            it('should throw BadRequestException', async () => {
                const pipe = new ParseUUIDPipe();

                expect(() => pipe.transform('invalid-uuid', { type: 'param', metatype: String })).toThrow(
                    BadRequestException
                );
            });
        });

        describe('when service throws an error', () => {
            it('should propagate the error', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const error = new Error('Service error');
                mockDevicesService.findOneDevice.mockRejectedValue(error);

                await expect(controller.findOneDevice(deviceId)).rejects.toThrow('Service error');
            });
        });
    });

    describe('createDevice', () => {
        describe('when valid data is provided', () => {
            it('should create a device and return success status', () => {
                const createDeviceDto: CreateDeviceDto = {
                    name: 'New Device',
                    model: 'New Model',
                    manufacturer: 'New Manufacturer',
                };
                const expectedResponse = makeSuccessResponse();
                mockDevicesService.createDevice.mockReturnValue(expectedResponse);

                const result = controller.createDevice(createDeviceDto);

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.createDevice).toHaveBeenCalledWith(createDeviceDto);
            });
        });

        describe('when invalid data is provided', () => {
            it('should throw ValidationPipe errors', async () => {
                // In a real scenario, NestJS would handle this before the controller method is called
                const pipe = new ValidationPipe();
                const invalidDto = {};

                await expect(pipe.transform(invalidDto, { type: 'body', metatype: CreateDeviceDto })).rejects.toThrow();
            });
        });

        describe('when service throws an error', () => {
            it('should propagate the error', () => {
                const createDeviceDto: CreateDeviceDto = {
                    name: 'New Device',
                    model: 'New Model',
                    manufacturer: 'New Manufacturer',
                };
                const error = new Error('Service error');
                mockDevicesService.createDevice.mockImplementation(() => {
                    throw error;
                });

                expect(() => controller.createDevice(createDeviceDto)).toThrow('Service error');
            });
        });
    });

    describe('updateDevice', () => {
        describe('when device exists', () => {
            it('should update the device and return success status', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const updateDeviceDto: UpdateDeviceDto = {
                    name: 'Updated Device',
                };
                const expectedResponse = makeSuccessResponse();
                mockDevicesService.updateDevice.mockResolvedValue(expectedResponse);

                const result = await controller.updateDevice(deviceId, updateDeviceDto);

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.updateDevice).toHaveBeenCalledWith(deviceId, updateDeviceDto);
            });
        });

        describe('when device does not exist', () => {
            it('should return undefined', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const updateDeviceDto: UpdateDeviceDto = {
                    name: 'Updated Device',
                };
                mockDevicesService.updateDevice.mockResolvedValue(undefined);

                const result = await controller.updateDevice(deviceId, updateDeviceDto);

                expect(result).toBeUndefined();
                expect(mockDevicesService.updateDevice).toHaveBeenCalledWith(deviceId, updateDeviceDto);
            });
        });

        describe('when invalid UUID is provided', () => {
            it('should throw BadRequestException', async () => {
                const pipe = new ParseUUIDPipe();

                expect(() => pipe.transform('invalid-uuid', { type: 'param', metatype: String })).toThrow(
                    BadRequestException
                );
            });
        });

        describe('when invalid data is provided', () => {
            it('should throw ValidationPipe errors for invalid fields', async () => {
                const pipe = new ValidationPipe();
                const invalidDto = {
                    name: 123,
                };

                await expect(pipe.transform(invalidDto, { type: 'body', metatype: UpdateDeviceDto })).rejects.toThrow();
            });
        });

        describe('when service throws an error', () => {
            it('should propagate the error', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const updateDeviceDto: UpdateDeviceDto = {
                    name: 'Updated Device',
                };
                const error = new Error('Service error');
                mockDevicesService.updateDevice.mockRejectedValue(error);

                await expect(controller.updateDevice(deviceId, updateDeviceDto)).rejects.toThrow('Service error');
            });
        });
    });

    describe('deleteDevice', () => {
        describe('when device exists', () => {
            it('should delete the device and return success status', () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const expectedResponse = makeSuccessResponse();
                mockDevicesService.deleteDevice.mockReturnValue(expectedResponse);

                const result = controller.deleteDevice(deviceId);

                expect(result).toEqual(expectedResponse);
                expect(mockDevicesService.deleteDevice).toHaveBeenCalledWith(deviceId);
            });
        });

        describe('when invalid UUID is provided', () => {
            it('should throw BadRequestException', async () => {
                const pipe = new ParseUUIDPipe();

                expect(() => pipe.transform('invalid-uuid', { type: 'param', metatype: String })).toThrow(
                    BadRequestException
                );
            });
        });

        describe('when service throws an error', () => {
            it('should propagate the error', () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const error = new Error('Service error');
                mockDevicesService.deleteDevice.mockImplementation(() => {
                    throw error;
                });

                expect(() => controller.deleteDevice(deviceId)).toThrow('Service error');
            });
        });
    });
});
