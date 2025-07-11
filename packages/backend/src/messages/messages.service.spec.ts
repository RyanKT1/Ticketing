import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './message.repository';
import { TicketsService } from '../tickets/tickets.service';
import type { CreateMessageDto } from './dto/create-message.dto';
import {
  makeSuccessResponse,
  makeErrorResponse,
  ErrorTypes,
  ErrorCode,
} from '../helpers/response.helper';

describe('MessagesService', () => {
  let service: MessagesService;
  let mockMessagesRepository: Record<string, jest.Mock>;
  let mockTicketsService: Record<string, jest.Mock>;
  let mockLogger: Record<string, jest.Mock>;

  const mockMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ticketId: '456e7890-e12d-34f5-a678-426614174000',
    content: 'Test Message Content',
    sentBy: 'user1',
    createdAt: new Date('2023-01-01'),
  };

  const mockMessage2 = {
    id: '789e0123-e45f-67a8-b901-426614174000',
    ticketId: '456e7890-e12d-34f5-a678-426614174000',
    content: 'Test Message Content 2',
    sentBy: 'user2',
    createdAt: new Date('2023-01-02'),
  };

  const mockTicket = {
    id: '456e7890-e12d-34f5-a678-426614174000',
    deviceId: '789e0123-e45f-67a8-b901-426614174000',
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

  beforeEach(async () => {
    jest.clearAllMocks();

    mockMessagesRepository = {
      findAllMessages: jest.fn(),
      findOneMessage: jest.fn(),
      upsertOneMessage: jest.fn(),
      deleteOneMessage: jest.fn(),
    };

    mockTicketsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: MessagesRepository,
          useValue: mockMessagesRepository,
        },
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);

    mockLogger = {
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

  describe('create', () => {
    describe('when provided with valid message data and user has access to ticket', () => {
      it('should return success response with created status', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message Content',
          sentBy: 'user1',
        };

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));
        mockMessagesRepository.upsertOneMessage.mockResolvedValue(undefined);

        const result = await service.create(createMessageDto, false);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            statusCode: 201,
          }),
        );
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(
          createMessageDto.ticketId,
          createMessageDto.sentBy,
          false,
        );
        expect(mockMessagesRepository.upsertOneMessage).toHaveBeenCalled();
      });
    });

    describe('when provided with valid message data without file', () => {
      it('should return success response with created status', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message Content',
          sentBy: 'user1',
        };

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));
        mockMessagesRepository.upsertOneMessage.mockResolvedValue(undefined);

        const result = await service.create(createMessageDto, false);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            statusCode: 201,
          }),
        );
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(
          createMessageDto.ticketId,
          createMessageDto.sentBy,
          false,
        );
        expect(mockMessagesRepository.upsertOneMessage).toHaveBeenCalled();
      });
    });

    describe('when user does not have access to the ticket', () => {
      it('should return error response from ticket service', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message Content',
          sentBy: 'user2',
        };

        const forbiddenError = makeErrorResponse(ErrorTypes[ErrorCode.FORBIDDEN], 'Not authorized');
        mockTicketsService.findOne.mockResolvedValue(forbiddenError);

        const result = await service.create(createMessageDto, false);

        expect(result).toEqual(forbiddenError);
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(
          createMessageDto.ticketId,
          createMessageDto.sentBy,
          false,
        );
        expect(mockMessagesRepository.upsertOneMessage).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const createMessageDto: CreateMessageDto = {
          ticketId: '456e7890-e12d-34f5-a678-426614174000',
          content: 'New Message Content',
          sentBy: 'user1',
        };

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));

        const error = new Error('Database error');
        mockMessagesRepository.upsertOneMessage.mockRejectedValue(error);

        const result = await service.create(createMessageDto, false);

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

  describe('findAll', () => {
    describe('when messages exist and user has access to ticket', () => {
      it('should return all messages with success status', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const username = 'user1';
        const isAdmin = false;
        const messages = [mockMessage, mockMessage2];

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));
        mockMessagesRepository.findAllMessages.mockResolvedValue(messages);

        const result = await service.findAll(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: messages,
            statusCode: 200,
          }),
        );
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, username, isAdmin);
        expect(mockMessagesRepository.findAllMessages).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when no messages exist but user has access to ticket', () => {
      it('should return an empty array with success status', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));
        mockMessagesRepository.findAllMessages.mockResolvedValue([]);

        const result = await service.findAll(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: [],
            statusCode: 200,
          }),
        );
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, username, isAdmin);
        expect(mockMessagesRepository.findAllMessages).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when user does not have access to the ticket', () => {
      it('should return error response from ticket service', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const username = 'user2';
        const isAdmin = false;

        const forbiddenError = makeErrorResponse(ErrorTypes[ErrorCode.FORBIDDEN], 'Not authorized');
        mockTicketsService.findOne.mockResolvedValue(forbiddenError);

        const result = await service.findAll(ticketId, username, isAdmin);

        expect(result).toEqual(forbiddenError);
        expect(mockTicketsService.findOne).toHaveBeenCalledWith(ticketId, username, isAdmin);
        expect(mockMessagesRepository.findAllMessages).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const ticketId = '456e7890-e12d-34f5-a678-426614174000';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsService.findOne.mockResolvedValue(makeSuccessResponse(mockTicket));

        const error = new Error('Database error');
        mockMessagesRepository.findAllMessages.mockRejectedValue(error);

        const result = await service.findAll(ticketId, username, isAdmin);

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

  describe('remove', () => {
    describe('when message exists and user is sender', () => {
      it('should delete the message and return success status', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        mockMessagesRepository.findOneMessage.mockResolvedValue(mockMessage);
        mockMessagesRepository.deleteOneMessage.mockResolvedValue({
          Attributes: { id: { S: messageId } },
        });

        const result = await service.remove(messageId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockMessagesRepository.findOneMessage).toHaveBeenCalledWith(messageId);
        expect(mockMessagesRepository.deleteOneMessage).toHaveBeenCalledWith(messageId);
      });
    });

    describe('when message exists without attachment and user is sender', () => {
      it('should delete the message and return success status', async () => {
        const messageId = '789e0123-e45f-67a8-b901-426614174000';
        const username = 'user2';
        const isAdmin = false;

        mockMessagesRepository.findOneMessage.mockResolvedValue(mockMessage2);
        mockMessagesRepository.deleteOneMessage.mockResolvedValue({
          Attributes: { id: { S: messageId } },
        });

        const result = await service.remove(messageId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockMessagesRepository.findOneMessage).toHaveBeenCalledWith(messageId);
        expect(mockMessagesRepository.deleteOneMessage).toHaveBeenCalledWith(messageId);
      });
    });

    describe('when message exists and user is admin', () => {
      it('should delete the message and return success status', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'admin';
        const isAdmin = true;

        mockMessagesRepository.findOneMessage.mockResolvedValue(mockMessage);
        mockMessagesRepository.deleteOneMessage.mockResolvedValue({
          Attributes: { id: { S: messageId } },
        });

        const result = await service.remove(messageId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockMessagesRepository.findOneMessage).toHaveBeenCalledWith(messageId);
        expect(mockMessagesRepository.deleteOneMessage).toHaveBeenCalledWith(messageId);
      });
    });

    describe('when message exists but user is not sender or admin', () => {
      it('should return forbidden error response', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user2';
        const isAdmin = false;

        mockMessagesRepository.findOneMessage.mockResolvedValue(mockMessage);

        const result = await service.remove(messageId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'FORBIDDEN',
            }),
          }),
        );
        expect(mockMessagesRepository.findOneMessage).toHaveBeenCalledWith(messageId);
        expect(mockMessagesRepository.deleteOneMessage).not.toHaveBeenCalled();
      });
    });

    describe('when message does not exist', () => {
      it('should return not found error response', async () => {
        const messageId = 'non-existent-id';
        const username = 'user1';
        const isAdmin = false;

        mockMessagesRepository.findOneMessage.mockResolvedValue(undefined);

        const result = await service.remove(messageId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockMessagesRepository.findOneMessage).toHaveBeenCalledWith(messageId);
        expect(mockMessagesRepository.deleteOneMessage).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const messageId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        const error = new Error('Database error');
        mockMessagesRepository.findOneMessage.mockRejectedValue(error);

        const result = await service.remove(messageId, username, isAdmin);

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
