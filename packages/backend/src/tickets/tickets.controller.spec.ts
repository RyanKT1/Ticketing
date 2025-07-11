import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import type { CreateTicketDto } from './dto/create-ticket.dto';
import type { UpdateTicketDto } from './dto/update-ticket.dto';
import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import {
  makeSuccessResponse,
  makeErrorResponse,
  ErrorTypes,
  ErrorCode,
} from '../helpers/response.helper';
import type { Response } from 'express';
import { RequestContextProvider } from '../auth/providers/request-context.provider';
import { ApiGatewayAuthGuard } from '../auth/guards/api-gateway-auth.guard';

describe('TicketsController', () => {
  let controller: TicketsController;
  let mockTicketsService: Record<string, jest.Mock>;
  let mockRequestContextProvider: Record<string, jest.Mock>;

  const mockTicket = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: '456e7890-e12d-34f5-a678-426614174000',
    deviceModel: 'Test Model',
    deviceManufacturer: 'Test Manufacturer',
    title: 'Test Title',
    description: 'Test Description',
    ticketOwner: 'user1',
    severity: 1,
    resolved: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockTicket2 = {
    id: '789e0123-e45f-67a8-b901-426614174000',
    deviceId: '456e7890-e12d-34f5-a678-426614174000',
    deviceModel: 'Test Model 2',
    deviceManufacturer: 'Test Manufacturer 2',
    title: 'Test Title 2',
    description: 'Test Description 2',
    ticketOwner: 'user2',
    severity: 2,
    resolved: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
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

    mockTicketsService = {
      findAll: jest.fn(),
      findAllByOwner: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockRequestContextProvider = {
      getAuthorizer: jest.fn().mockReturnValue({
        claims: {
          sub: 'test-user-id',
          'cognito:username': 'test-user',
          email: 'test@example.com',
          'cognito:groups': ['Users'],
        },
      }),
      getIdentity: jest.fn(),
      setEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
        {
          provide: RequestContextProvider,
          useValue: mockRequestContextProvider,
        },
        {
          provide: ApiGatewayAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    describe('when provided with valid ticket data', () => {
      it('should return success response with created status', async () => {
        const createTicketDto: CreateTicketDto = {
          deviceId: '456e7890-e12d-34f5-a678-426614174000',
          deviceModel: 'New Model',
          deviceManufacturer: 'New Manufacturer',
          title: 'New Title',
          description: 'New Description',
          severity: 1,
          ticketOwner: 'user1',
        };

        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(null, 201);
        mockTicketsService.create.mockResolvedValue(successResponse);

        await controller.create(createTicketDto, req, res);

        expect(mockTicketsService.create).toHaveBeenCalledWith({
          ...createTicketDto,
          ticketOwner: 'user1',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when ticketOwner is not provided in DTO', () => {
      it('should use the username from the request', async () => {
        const createTicketDto: CreateTicketDto = {
          deviceId: '456e7890-e12d-34f5-a678-426614174000',
          deviceModel: 'New Model',
          deviceManufacturer: 'New Manufacturer',
          title: 'New Title',
          description: 'New Description',
          severity: 1,
          ticketOwner: '',
        };

        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(null, 201);
        mockTicketsService.create.mockResolvedValue(successResponse);

        await controller.create(createTicketDto, req, res);

        expect(mockTicketsService.create).toHaveBeenCalledWith({
          ...createTicketDto,
          ticketOwner: 'user1',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const createTicketDto: CreateTicketDto = {
          deviceId: '456e7890-e12d-34f5-a678-426614174000',
          deviceModel: 'New Model',
          deviceManufacturer: 'New Manufacturer',
          title: 'New Title',
          description: 'New Description',
          severity: 1,
          ticketOwner: 'user1',
        };

        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockTicketsService.create.mockRejectedValue(error);

        await expect(controller.create(createTicketDto, req, res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('findAll', () => {
    describe('when user is admin', () => {
      it('should return all tickets with success status', async () => {
        const tickets = [mockTicket, mockTicket2];
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(tickets);
        mockTicketsService.findAll.mockResolvedValue(successResponse);

        await controller.findAll(req, res);

        expect(mockTicketsService.findAll).toHaveBeenCalled();
        expect(mockTicketsService.findAllByOwner).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is not admin', () => {
      it('should return only user tickets with success status', async () => {
        const userTickets = [mockTicket];
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(userTickets);
        mockTicketsService.findAllByOwner.mockResolvedValue(successResponse);

        await controller.findAll(req, res);

        expect(mockTicketsService.findAll).not.toHaveBeenCalled();
        expect(mockTicketsService.findAllByOwner).toHaveBeenCalledWith('user1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockTicketsService.findAll.mockRejectedValue(error);

        await expect(controller.findAll(req, res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('findOne', () => {
    describe('when ticket exists and user has access', () => {
      it('should return the ticket with success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(mockTicket);
        mockTicketsService.findOne.mockResolvedValue(successResponse);

        await controller.findOne(ticketId, req, res);

        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(mockTicket);
        mockTicketsService.findOne.mockResolvedValue(successResponse);

        await controller.findOne(ticketId, req, res);

        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, 'admin', true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Ticket with id ${ticketId} not found`,
        );
        mockTicketsService.findOne.mockResolvedValue(errorResponse);

        await controller.findOne(ticketId, req, res);

        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, 'user1', false);
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
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockTicketsService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(ticketId, req, res)).rejects.toThrow('Service error');
      });
    });
  });

  describe('update', () => {
    describe('when ticket exists and user has access', () => {
      it('should update the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
          severity: 2,
        };
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockTicketsService.update.mockResolvedValue(successResponse);

        await controller.update(ticketId, updateTicketDto, req, res);

        expect(mockTicketsService.update).toHaveBeenCalledWith(
          ticketId,
          updateTicketDto,
          'user1',
          false,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const updateTicketDto: UpdateTicketDto = {
          resolved: true,
        };
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockTicketsService.update.mockResolvedValue(successResponse);

        await controller.update(ticketId, updateTicketDto, req, res);

        expect(mockTicketsService.update).toHaveBeenCalledWith(
          ticketId,
          updateTicketDto,
          'admin',
          true,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
        };
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Ticket with id ${ticketId} not found`,
        );
        mockTicketsService.update.mockResolvedValue(errorResponse);

        await controller.update(ticketId, updateTicketDto, req, res);

        expect(mockTicketsService.update).toHaveBeenCalledWith(
          ticketId,
          updateTicketDto,
          'user1',
          false,
        );
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
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
        };
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockTicketsService.update.mockRejectedValue(error);

        await expect(controller.update(ticketId, updateTicketDto, req, res)).rejects.toThrow(
          'Service error',
        );
      });
    });
  });

  describe('remove', () => {
    describe('when ticket exists and user has access', () => {
      it('should delete the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockTicketsService.remove.mockResolvedValue(successResponse);

        await controller.remove(ticketId, req, res);

        expect(mockTicketsService.remove).toHaveBeenCalledWith(ticketId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockTicketsService.remove.mockResolvedValue(successResponse);

        await controller.remove(ticketId, req, res);

        expect(mockTicketsService.remove).toHaveBeenCalledWith(ticketId, 'admin', true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Ticket with id ${ticketId} not found`,
        );
        mockTicketsService.remove.mockResolvedValue(errorResponse);

        await controller.remove(ticketId, req, res);

        expect(mockTicketsService.remove).toHaveBeenCalledWith(ticketId, 'user1', false);
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
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockTicketsService.remove.mockRejectedValue(error);

        await expect(controller.remove(ticketId, req, res)).rejects.toThrow('Service error');
      });
    });
  });
});
