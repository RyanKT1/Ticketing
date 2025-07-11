import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import type { CreateMessageDto } from './dto/create-message.dto';
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

describe('MessagesController', () => {
  let controller: MessagesController;
  let mockMessagesService: Record<string, jest.Mock>;
  let mockRequestContextProvider: Record<string, jest.Mock>;

  const mockMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ticketId: '456e7890-e12d-34f5-a678-426614174000',
    content: 'Test Message',
    sentBy: 'user1',
    createdAt: new Date('2023-01-01'),
  };

  const mockMessage2 = {
    id: '789e0123-e45f-67a8-b901-426614174000',
    ticketId: '456e7890-e12d-34f5-a678-426614174000',
    content: 'Test Message 2',
    sentBy: 'user2',
    createdAt: new Date('2023-01-02'),
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

    mockMessagesService = {
      create: jest.fn(),
      findAll: jest.fn(),
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
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockMessagesService,
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

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    describe('when provided with valid message data', () => {
      it('should return success response with created status', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message',
          sentBy: '',
        };

        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(null, 201);
        mockMessagesService.create.mockResolvedValue(successResponse);

        await controller.create(createMessageDto, req, res);

        expect(mockMessagesService.create).toHaveBeenCalledWith(
          {
            ...createMessageDto,
            sentBy: 'user1',
          },
          false,
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message',
          sentBy: '',
        };

        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(null, 201);
        mockMessagesService.create.mockResolvedValue(successResponse);

        await controller.create(createMessageDto, req, res);

        expect(mockMessagesService.create).toHaveBeenCalledWith(
          {
            ...createMessageDto,
            sentBy: 'admin',
          },
          true,
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message',
          sentBy: '',
        };

        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockMessagesService.create.mockRejectedValue(error);

        await expect(controller.create(createMessageDto, req, res)).rejects.toThrow(
          'Service error',
        );
      });
    });
  });

  describe('findAllByTicketId', () => {
    describe('when messages exist and user has access', () => {
      it('should return all messages with success status', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const messages = [mockMessage, mockMessage2];
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse(messages);
        mockMessagesService.findAll.mockResolvedValue(successResponse);

        await controller.findAllByTicketId(ticketId, req, res);

        expect(mockMessagesService.findAll).toHaveBeenCalledWith(ticketId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse([mockMessage, mockMessage2]);
        mockMessagesService.findAll.mockResolvedValue(successResponse);

        await controller.findAllByTicketId(ticketId, req, res);

        expect(mockMessagesService.findAll).toHaveBeenCalledWith(ticketId, 'admin', true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user does not have access to the ticket', () => {
      it('should return forbidden error response', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const req = {
          user: {
            username: 'user2',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You do not have permission to access this ticket',
        );
        mockMessagesService.findAll.mockResolvedValue(errorResponse);

        await controller.findAllByTicketId(ticketId, req, res);

        expect(mockMessagesService.findAll).toHaveBeenCalledWith(ticketId, 'user2', false);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockMessagesService.findAll.mockRejectedValue(error);

        await expect(controller.findAllByTicketId(ticketId, req, res)).rejects.toThrow(
          'Service error',
        );
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
  });

  describe('remove', () => {
    describe('when message exists and user is sender', () => {
      it('should delete the message and return success status', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockMessagesService.remove.mockResolvedValue(successResponse);

        await controller.remove(messageId, req, res);

        expect(mockMessagesService.remove).toHaveBeenCalledWith(messageId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when user is admin', () => {
      it('should pass isAdmin as true to service', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'admin',
            groups: ['Admins'],
          },
        };

        const res = mockResponse();
        const successResponse = makeSuccessResponse();
        mockMessagesService.remove.mockResolvedValue(successResponse);

        await controller.remove(messageId, req, res);

        expect(mockMessagesService.remove).toHaveBeenCalledWith(messageId, 'admin', true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(successResponse);
      });
    });

    describe('when message does not exist', () => {
      it('should return not found error response', async () => {
        const messageId = 'non-existent-id';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Message with id ${messageId} not found`,
        );
        mockMessagesService.remove.mockResolvedValue(errorResponse);

        await controller.remove(messageId, req, res);

        expect(mockMessagesService.remove).toHaveBeenCalledWith(messageId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when user is not authorized to delete the message', () => {
      it('should return forbidden error response', async () => {
        const messageId = '789e0123-e45f-67a8-b901-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const errorResponse = makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You do not have permission to delete this message',
        );
        mockMessagesService.remove.mockResolvedValue(errorResponse);

        await controller.remove(messageId, req, res);

        expect(mockMessagesService.remove).toHaveBeenCalledWith(messageId, 'user1', false);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(errorResponse);
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const req = {
          user: {
            username: 'user1',
            groups: ['Users'],
          },
        };

        const res = mockResponse();
        const error = new Error('Service error');
        mockMessagesService.remove.mockRejectedValue(error);

        await expect(controller.remove(messageId, req, res)).rejects.toThrow('Service error');
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
  });
});
