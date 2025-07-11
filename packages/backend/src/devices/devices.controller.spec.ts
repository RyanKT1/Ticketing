import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device-dto';
import { UpdateDeviceDto } from './dto/update-device-dto';
import { BadRequestException, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import {
  makeSuccessResponse,
  makeErrorResponse,
  ErrorTypes,
  ErrorCode,
} from '../helpers/response.helper';
import type { Response } from 'express';
import { RequestContextProvider } from '../auth/providers/request-context.provider';
import { ApiGatewayAuthGuard } from '../auth/guards/api-gateway-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('DevicesController', () => {
  let controller: DevicesController;
  let mockDevicesService: Record<string, jest.Mock>;
  let mockRequestContextProvider: Record<string, jest.Mock>;

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

  // Mock response object
  const mockResponse = () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDevicesService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockRequestContextProvider = {
      getAuthorizer: jest.fn().mockReturnValue({
        claims: {
          sub: 'test-user-id',
          'cognito:username': 'test-user',
          email: 'test@example.com',
          'cognito:groups': ['Users', 'Admins'],
        },
      }),
      getIdentity: jest.fn(),
      setEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
        {
          provide: RequestContextProvider,
          useValue: mockRequestContextProvider,
        },
        {
          provide: ApiGatewayAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    describe('when devices exist', () => {
      it('should return all devices with success status', async () => {
        const devices = [mockDevice, mockDevice2];
        const res = mockResponse();
        const successResponse = makeSuccessResponse(devices);
        mockDevicesService.findAll.mockResolvedValue(successResponse);

        await controller.findAll(res);

        expect(mockDevicesService.findAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when no devices exist', () => {
      it('should return an empty array with success status', async () => {
        const res = mockResponse();
        const successResponse = makeSuccessResponse([]);
        mockDevicesService.findAll.mockResolvedValue(successResponse);

        await controller.findAll(res);

        expect(mockDevicesService.findAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const res = mockResponse();
        const error = new Error('Service error');
        mockDevicesService.findAll.mockRejectedValue(error);

        await expect(controller.findAll(res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('findOne', () => {
    describe('when device exists', () => {
      it('should return the device with success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const res = mockResponse();
        const successResponse = makeSuccessResponse(mockDevice);
        mockDevicesService.findOne.mockResolvedValue(successResponse);

        await controller.findOne(deviceId, res);

        expect(mockDevicesService.findOne).toHaveBeenCalledWith(deviceId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Device with id: ${deviceId} was not found`,
        );
        mockDevicesService.findOne.mockResolvedValue(errorResponse);

        await controller.findOne(deviceId, res);

        expect(mockDevicesService.findOne).toHaveBeenCalledWith(deviceId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when invalid UUID is provided', () => {
      it('should throw BadRequestException', async () => {
        const pipe = new ParseUUIDPipe();

        await expect(
          pipe.transform('invalid-uuid', { type: 'param', metatype: String }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const res = mockResponse();
        const error = new Error('Service error');
        mockDevicesService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(deviceId, res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('create', () => {
    describe('when valid data is provided', () => {
      it('should create a device and return success status', async () => {
        const createDeviceDto: CreateDeviceDto = {
          name: 'New Device',
          model: 'New Model',
          manufacturer: 'New Manufacturer',
        };
        const res = mockResponse();
        const successResponse = makeSuccessResponse(null, 201);
        mockDevicesService.create.mockResolvedValue(successResponse);

        await controller.create(createDeviceDto, res);

        expect(mockDevicesService.create).toHaveBeenCalledWith(createDeviceDto);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when invalid data is provided', () => {
      it('should throw ValidationPipe errors', async () => {
        const pipe = new ValidationPipe();
        const invalidDto = {};

        await expect(
          pipe.transform(invalidDto, { type: 'body', metatype: CreateDeviceDto }),
        ).rejects.toThrow();
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const createDeviceDto: CreateDeviceDto = {
          name: 'New Device',
          model: 'New Model',
          manufacturer: 'New Manufacturer',
        };
        const res = mockResponse();
        const error = new Error('Service error');
        mockDevicesService.create.mockRejectedValue(error);

        await expect(controller.create(createDeviceDto, res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('update', () => {
    describe('when device exists', () => {
      it('should update the device and return success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };
        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockDevicesService.update.mockResolvedValue(successResponse);

        await controller.update(deviceId, updateDeviceDto, res);

        expect(mockDevicesService.update).toHaveBeenCalledWith(deviceId, updateDeviceDto);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };
        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Device with id: ${deviceId} was not found`,
        );
        mockDevicesService.update.mockResolvedValue(errorResponse);

        await controller.update(deviceId, updateDeviceDto, res);

        expect(mockDevicesService.update).toHaveBeenCalledWith(deviceId, updateDeviceDto);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when invalid UUID is provided', () => {
      it('should throw BadRequestException', async () => {
        const pipe = new ParseUUIDPipe();

        await expect(
          pipe.transform('invalid-uuid', { type: 'param', metatype: String }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('when invalid data is provided', () => {
      it('should throw ValidationPipe errors for invalid fields', async () => {
        const pipe = new ValidationPipe();
        const invalidDto = {
          name: 123, // Should be a string
        };

        await expect(
          pipe.transform(invalidDto, { type: 'body', metatype: UpdateDeviceDto }),
        ).rejects.toThrow();
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const updateDeviceDto: UpdateDeviceDto = {
          name: 'Updated Device',
        };
        const res = mockResponse();
        const error = new Error('Service error');
        mockDevicesService.update.mockRejectedValue(error);

        await expect(controller.update(deviceId, updateDeviceDto, res)).rejects.toThrow(
          'Service error',
        );
      });
    });
  });

  describe('delete', () => {
    describe('when device exists', () => {
      it('should delete the device and return success status', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockDevicesService.delete.mockResolvedValue(successResponse);

        await controller.delete(deviceId, res);

        expect(mockDevicesService.delete).toHaveBeenCalledWith(deviceId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when device does not exist', () => {
      it('should return not found error response', async () => {
        const deviceId = 'non-existent-id';
        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Device with id: ${deviceId} was not found`,
        );
        mockDevicesService.delete.mockResolvedValue(errorResponse);

        await controller.delete(deviceId, res);

        expect(mockDevicesService.delete).toHaveBeenCalledWith(deviceId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when invalid UUID is provided', () => {
      it('should throw BadRequestException', async () => {
        const pipe = new ParseUUIDPipe();

        await expect(
          pipe.transform('invalid-uuid', { type: 'param', metatype: String }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const deviceId = '123e4567-e89b-12d3-a456-426614174000';
        const res = mockResponse();
        const error = new Error('Service error');
        mockDevicesService.delete.mockRejectedValue(error);

        await expect(controller.delete(deviceId, res)).rejects.toThrow('Service error');
      });
    });
  });
});
