import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService, ResponseStatus, makeSuccessResponse } from './devices.service';
import { DevicesRepository } from './devices.repository';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { Device } from './entity/device.entity';
import { Logger } from '@nestjs/common';

// Mock the Logger
jest.mock('@nestjs/common', () => {
    const original = jest.requireActual('@nestjs/common');
    return {
        ...original,
        Logger: jest.fn().mockImplementation(() => ({
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        })),
    };
});

describe('DevicesService', () => {
    let service: DevicesService;
    let repository: DevicesRepository;
    let logger: Logger;

    const mockDevicesRepository = {
        findAllDevices: jest.fn(),
        findOneDevice: jest.fn(),
        upsertOneDevice: jest.fn(),
        deleteOneDevice: jest.fn(),
    };

    const mockDevice = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Device',
        model: 'Test Model',
        manufacturer: 'Test Manufacturer',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };
    const mockDevice2 = {
        id: '3d4c4225-6c48-4318-809b-91103ee478f0',
        name: 'Test Device2',
        model: 'Test Model2',
        manufacturer: 'Test Manufacturer2',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DevicesService,
                {
                    provide: DevicesRepository,
                    useValue: mockDevicesRepository,
                },
            ],
        }).compile();

        service = module.get<DevicesService>(DevicesService);
        repository = module.get<DevicesRepository>(DevicesRepository);

        logger = (service as any).logger;
    });

    describe('findAllDevices', () => {
        describe('when one device exist', () => {
            it('should return all devices with success status', async () => {
                const devices = [mockDevice];
                mockDevicesRepository.findAllDevices.mockResolvedValue(devices);

                const result = await service.findAllDevices();

                expect(result).toEqual(makeSuccessResponse(devices));
                expect(mockDevicesRepository.findAllDevices).toHaveBeenCalled();
                expect(logger.log).toHaveBeenCalledWith('Retrieving all devices');
            });
        });
        describe('when multiple devices exist', () => {
            it('should return all devices with success status', async () => {
                const devices = [mockDevice, mockDevice2];
                mockDevicesRepository.findAllDevices.mockResolvedValue(devices);

                const result = await service.findAllDevices();

                expect(result).toEqual(makeSuccessResponse(devices));
                expect(mockDevicesRepository.findAllDevices).toHaveBeenCalled();
                expect(logger.log).toHaveBeenCalledWith('Retrieving all devices');
            });
        });
        describe('when no devices exist', () => {
            it('should return an empty array with success status', async () => {
                mockDevicesRepository.findAllDevices.mockResolvedValue([]);

                const result = await service.findAllDevices();

                expect(result).toEqual(makeSuccessResponse([]));
                expect(mockDevicesRepository.findAllDevices).toHaveBeenCalled();
                expect(logger.log).toHaveBeenCalledWith('Retrieving all devices');
            });
        });

        describe('when repository throws an error', () => {
            it('should propagate the error', async () => {
                const error = new Error('Database error');
                mockDevicesRepository.findAllDevices.mockRejectedValue(error);

                await expect(service.findAllDevices()).rejects.toThrow('Database error');
                expect(logger.log).toHaveBeenCalledWith('Retrieving all devices');
            });
        });
    });

    describe('findOneDevice', () => {
        describe('when device exists', () => {
            it('should return the device with success status', async () => {
                mockDevicesRepository.findOneDevice.mockResolvedValue(mockDevice);
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';

                const result = await service.findOneDevice(deviceId);

                expect(result).toEqual(makeSuccessResponse(mockDevice));
                expect(mockDevicesRepository.findOneDevice).toHaveBeenCalledWith(deviceId);
                expect(logger.log).toHaveBeenCalledWith(`Retrieving device with id: ${deviceId}`);
            });
        });

        describe('when device does not exist', () => {
            it('should return success status with undefined result', async () => {
                mockDevicesRepository.findOneDevice.mockResolvedValue(undefined);
                const deviceId = 'non-existent-id';

                const result = await service.findOneDevice(deviceId);

                expect(result).toEqual(makeSuccessResponse(undefined));
                expect(mockDevicesRepository.findOneDevice).toHaveBeenCalledWith(deviceId);
                expect(logger.log).toHaveBeenCalledWith(`Retrieving device with id: ${deviceId}`);
            });
        });

        describe('when repository throws an error', () => {
            it('should propagate the error', async () => {
                const error = new Error('Database error');
                mockDevicesRepository.findOneDevice.mockRejectedValue(error);
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';

                await expect(service.findOneDevice(deviceId)).rejects.toThrow('Database error');
                expect(logger.log).toHaveBeenCalledWith(`Retrieving device with id: ${deviceId}`);
            });
        });
    });

    describe('createDevice', () => {
        describe('when provided correct fields', () => {
            it('should create the device and return success status', () => {
                const createDeviceDto: CreateDeviceDto = {
                    name: 'New Device',
                    model: 'New Model',
                    manufacturer: 'New Manufacturer',
                };

                const createdDevice = {
                    ...mockDevice,
                    name: createDeviceDto.name,
                    model: createDeviceDto.model,
                    manufacturer: createDeviceDto.manufacturer,
                };

                mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

                const result = service.createDevice(createDeviceDto);

                expect(result).toEqual(makeSuccessResponse());
                expect(Device.createDeviceInstanceFromDeviceDto).toHaveBeenCalledWith(createDeviceDto);
                expect(mockDevicesRepository.upsertOneDevice).toHaveBeenCalledWith(createdDevice);
                expect(logger.log).toHaveBeenCalledWith('Creating new device');
            });
        });

        describe('when repository throws an error', () => {
            it('should propagate the error', () => {
                const createDeviceDto: CreateDeviceDto = {
                    name: 'New Device',
                    model: 'New Model',
                    manufacturer: 'New Manufacturer',
                };

                const createdDevice = {
                    ...mockDevice,
                    name: createDeviceDto.name,
                    model: createDeviceDto.model,
                    manufacturer: createDeviceDto.manufacturer,
                };

                mockDevicesRepository.upsertOneDevice.mockImplementation(() => {
                    throw new Error('Database error');
                });

                expect(() => service.createDevice(createDeviceDto)).toThrow('Database error');
                expect(logger.log).toHaveBeenCalledWith('Creating new device');
            });
        });
    });

    describe('updateDevice', () => {
        describe('when device exists', () => {
            describe('and one field is provided', () => {
                it('should update the device and return success status', async () => {
                    const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                    const updateDeviceDto: UpdateDeviceDto = {
                        name: 'Updated Device',
                    };

                    const existingDevice = { ...mockDevice };
                    mockDevicesRepository.findOneDevice.mockResolvedValue(existingDevice);
                    mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

                    const result = await service.updateDevice(deviceId, updateDeviceDto);

                    expect(result).toEqual(makeSuccessResponse());
                    expect(mockDevicesRepository.findOneDevice).toHaveBeenCalledWith(deviceId);
                    expect(mockDevicesRepository.upsertOneDevice).toHaveBeenCalled();
                    expect(existingDevice.name).toBe('Updated Device');
                    expect(existingDevice.updatedAt).toBeInstanceOf(Date);
                    expect(logger.log).toHaveBeenCalledWith(`Updating device with id: ${deviceId}`);
                });
            });
            describe('and multiple fields are provided', () => {
                it('should update the device and return success status', async () => {
                    const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                    const updateDeviceDto: UpdateDeviceDto = {
                        name: 'Updated Device',
                        model: 'Updated Model',
                        manufacturer: 'Updated Manufacturer',
                    };

                    const existingDevice = { ...mockDevice };
                    mockDevicesRepository.findOneDevice.mockResolvedValue(existingDevice);
                    mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

                    const result = await service.updateDevice(deviceId, updateDeviceDto);

                    expect(result).toEqual(makeSuccessResponse());
                    expect(existingDevice.name).toBe('Updated Device');
                    expect(existingDevice.model).toBe('Updated Model');
                    expect(existingDevice.manufacturer).toBe('Updated Manufacturer');
                    expect(logger.log).toHaveBeenCalledWith(`Updating device with id: ${deviceId}`);
                });
            });
        });

        describe('when device does not exist', () => {
            it('should return undefined and log an error', async () => {
                const deviceId = 'non-existent-id';
                const updateDeviceDto: UpdateDeviceDto = {
                    name: 'Updated Device',
                };

                mockDevicesRepository.findOneDevice.mockResolvedValue(undefined);

                const result = await service.updateDevice(deviceId, updateDeviceDto);

                expect(result).toBeUndefined();
                expect(mockDevicesRepository.findOneDevice).toHaveBeenCalledWith(deviceId);
                expect(mockDevicesRepository.upsertOneDevice).not.toHaveBeenCalled();
                expect(logger.log).toHaveBeenCalledWith(`Updating device with id: ${deviceId}`);
                expect(logger.error).toHaveBeenCalledWith(`Device with id: ${deviceId} was not found.`);
            });
        });

        describe('when repository throws an error', () => {
            it('should propagate the error', async () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                const updateDeviceDto: UpdateDeviceDto = {
                    name: 'Updated Device',
                };

                const error = new Error('Database error');
                mockDevicesRepository.findOneDevice.mockRejectedValue(error);

                await expect(service.updateDevice(deviceId, updateDeviceDto)).rejects.toThrow('Database error');
                expect(logger.log).toHaveBeenCalledWith(`Updating device with id: ${deviceId}`);
            });
        });
    });

    describe('deleteDevice', () => {
        describe('when deleting a device', () => {
            it('should delete the device and return success status', () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                mockDevicesRepository.deleteOneDevice.mockResolvedValue(true);

                const result = service.deleteDevice(deviceId);

                expect(result).toEqual(makeSuccessResponse());
                expect(mockDevicesRepository.deleteOneDevice).toHaveBeenCalledWith(deviceId);
                expect(logger.log).toHaveBeenCalledWith(`Deleting device with id: ${deviceId}`);
            });
        });

        describe('when repository throws an error', () => {
            it('should propagate the error', () => {
                const deviceId = '123e4567-e89b-12d3-a456-426614174000';
                mockDevicesRepository.deleteOneDevice.mockImplementation(() => {
                    throw new Error('Database error');
                });

                expect(() => service.deleteDevice(deviceId)).toThrow('Database error');
                expect(logger.log).toHaveBeenCalledWith(`Deleting device with id: ${deviceId}`);
            });
        });
    });
});
