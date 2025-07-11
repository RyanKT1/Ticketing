import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { DevicesRepository } from './devices.repository';
import type { CreateDeviceDto } from './dto/create-device-dto';
import type { UpdateDeviceDto } from './dto/update-device-dto';
import { makeSuccessResponse } from '../helpers/response.helper';

describe('DevicesService', () => {
  let service: DevicesService;
  let mockDevicesRepository: Record<string, jest.Mock>;

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

    mockDevicesRepository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      upsertOneDevice: jest.fn(),
      deleteOneDevice: jest.fn(),
    };

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

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const serviceAny = service as any;
    serviceAny.logger = mockLogger;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    describe('when devices exist', () => {
      it('should return all devices with success status', async () => {
        const devices = [mockDevice, mockDevice2];
        mockDevicesRepository.findAll.mockResolvedValue(devices);

        const result = await service.findAll();

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: devices,
            statusCode: 200,
          }),
        );
        expect(mockDevicesRepository.findAll).toHaveBeenCalled();
      });
    });

    describe('when no devices exist', () => {
      it('should return an empty array with success status', async () => {
        mockDevicesRepository.findAll.mockResolvedValue([]);

        const result = await service.findAll();

        expect(result).toEqual(makeSuccessResponse([]));
        expect(mockDevicesRepository.findAll).toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const error = new Error('Database error');
        mockDevicesRepository.findAll.mockRejectedValue(error);

        const result = await service.findAll();

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'DATABASE_ERROR',
            }),
          }),
        );
      });
    });
  });

  describe('findOne', () => {
    describe('when device exists', () => {
      it('should return the device with success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        mockDevicesRepository.findOne.mockResolvedValue(mockDevice);

        const result = await service.findOne(deviceId);

        expect(result).toEqual(makeSuccessResponse(mockDevice));
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        mockDevicesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.findOne(deviceId);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const error = new Error('Database error');
        mockDevicesRepository.findOne.mockRejectedValue(error);

        const result = await service.findOne(deviceId);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'DATABASE_ERROR',
            }),
          }),
        );
      });
    });
  });

  describe('create', () => {
    describe('when provided with valid device data', () => {
      it('should return success response with created status', async () => {
        const createDeviceDto: CreateDeviceDto = {
          name: 'New Device',
          model: 'New Model',
          manufacturer: 'New Manufacturer',
        };

        mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

        const result = await service.create(createDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            statusCode: 201,
          }),
        );
        expect(mockDevicesRepository.upsertOneDevice).toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const createDeviceDto: CreateDeviceDto = {
          name: 'New Device',
          model: 'New Model',
          manufacturer: 'New Manufacturer',
        };

        const error = new Error('Database error');
        mockDevicesRepository.upsertOneDevice.mockRejectedValue(error);

        const result = await service.create(createDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'DATABASE_ERROR',
            }),
          }),
        );
      });
    });
  });

  describe('update', () => {
    describe('when device exists', () => {
      it('should update the device and return success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
          model: 'Updated Model',
          manufacturer: 'Updated Manufacturer',
        };

        const existingDevice = { ...mockDevice };
        mockDevicesRepository.findOne.mockResolvedValue(existingDevice);
        mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

        const result = await service.update(deviceId, updateDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
        expect(mockDevicesRepository.upsertOneDevice).toHaveBeenCalled();
        expect(existingDevice.name).toBe('Updated Device');
        expect(existingDevice.model).toBe('Updated Model');
        expect(existingDevice.manufacturer).toBe('Updated Manufacturer');
        expect(existingDevice.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('when only some fields are provided', () => {
      it('should update only the provided fields and return success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };

        const existingDevice = { ...mockDevice };
        mockDevicesRepository.findOne.mockResolvedValue(existingDevice);
        mockDevicesRepository.upsertOneDevice.mockResolvedValue(undefined);

        const result = await service.update(deviceId, updateDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
        expect(mockDevicesRepository.upsertOneDevice).toHaveBeenCalled();
        expect(existingDevice.name).toBe('Updated Device');
        expect(existingDevice.model).toBe('Test Model'); // Unchanged
        expect(existingDevice.manufacturer).toBe('Test Manufacturer'); // Unchanged
        expect(existingDevice.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };

        mockDevicesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.update(deviceId, updateDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
        expect(mockDevicesRepository.upsertOneDevice).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };

        const error = new Error('Database error');
        mockDevicesRepository.findOne.mockRejectedValue(error);

        const result = await service.update(deviceId, updateDeviceDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'DATABASE_ERROR',
            }),
          }),
        );
      });
    });
  });

  describe('delete', () => {
    describe('when device exists', () => {
      it('should delete the device and return success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        mockDevicesRepository.findOne.mockResolvedValue(mockDevice);
        mockDevicesRepository.deleteOneDevice.mockResolvedValue({
          Attributes: { id: { S: deviceId } },
        });

        const result = await service.delete(deviceId);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
        expect(mockDevicesRepository.deleteOneDevice).toHaveBeenCalledWith(deviceId);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        mockDevicesRepository.findOne.mockResolvedValue(undefined);

        const result = await service.delete(deviceId);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockDevicesRepository.findOne).toHaveBeenCalledWith(deviceId);
        expect(mockDevicesRepository.deleteOneDevice).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const error = new Error('Database error');
        mockDevicesRepository.findOne.mockRejectedValue(error);

        const result = await service.delete(deviceId);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'DATABASE_ERROR',
            }),
          }),
        );
      });
    });
  });
});
