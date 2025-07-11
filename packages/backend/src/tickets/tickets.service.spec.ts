import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import type { CreateTicketDto } from './dto/create-ticket.dto';
import type { UpdateTicketDto } from './dto/update-ticket.dto';
import { makeSuccessResponse } from '../helpers/response.helper';

describe('TicketsService', () => {
  let service: TicketsService;
  let mockTicketsRepository: Record<string, jest.Mock>;

  const mockTicket = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    deviceId: '456e7890-e12d-34f5-a678-426614174000',
    deviceModel: 'Test Model',
    deviceManufacturer: 'Test Manufacturer',
    title: 'Test Description',
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
    description: 'Test Description 2',
    ticketOwner: 'user2',
    severity: 2,
    resolved: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTicketsRepository = {
      findAllTickets: jest.fn(),
      findAllTicketsByOwner: jest.fn(),
      findOneTicket: jest.fn(),
      upsertOneTicket: jest.fn(),
      deleteOneTicket: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketsRepository,
          useValue: mockTicketsRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);

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

        mockTicketsRepository.upsertOneTicket.mockResolvedValue(undefined);

        const result = await service.create(createTicketDto);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            statusCode: 201,
          }),
        );
        expect(mockTicketsRepository.upsertOneTicket).toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const createTicketDto: CreateTicketDto = {
          deviceId: '456e7890-e12d-34f5-a678-426614174000',
          deviceModel: 'New Model',
          deviceManufacturer: 'New Manufacturer',
          description: 'New Description',
          title: 'New Title',
          severity: 1,
          ticketOwner: 'user1',
        };

        const error = new Error('Database error');
        mockTicketsRepository.upsertOneTicket.mockRejectedValue(error);

        const result = await service.create(createTicketDto);

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
    describe('when tickets exist', () => {
      it('should return all tickets with success status', async () => {
        const tickets = [mockTicket, mockTicket2];
        mockTicketsRepository.findAllTickets.mockResolvedValue(tickets);

        const result = await service.findAll();

        expect(result).toEqual(makeSuccessResponse(tickets));
        expect(mockTicketsRepository.findAllTickets).toHaveBeenCalled();
      });
    });

    describe('when no tickets exist', () => {
      it('should return an empty array with success status', async () => {
        mockTicketsRepository.findAllTickets.mockResolvedValue([]);

        const result = await service.findAll();

        expect(result).toEqual(makeSuccessResponse([]));
        expect(mockTicketsRepository.findAllTickets).toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const error = new Error('Database error');
        mockTicketsRepository.findAllTickets.mockRejectedValue(error);

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

  describe('findAllByOwner', () => {
    describe('when tickets exist for the owner', () => {
      it('should return all owner tickets with success status', async () => {
        const ownerTickets = [mockTicket];
        const ticketOwner = 'user1';
        mockTicketsRepository.findAllTicketsByOwner.mockResolvedValue(ownerTickets);

        const result = await service.findAllByOwner(ticketOwner);

        expect(result).toEqual(makeSuccessResponse(ownerTickets));
        expect(mockTicketsRepository.findAllTicketsByOwner).toHaveBeenCalledWith(ticketOwner);
      });
    });

    describe('when no tickets exist for the owner', () => {
      it('should return an empty array with success status', async () => {
        const ticketOwner = 'nonexistentuser';
        mockTicketsRepository.findAllTicketsByOwner.mockResolvedValue([]);

        const result = await service.findAllByOwner(ticketOwner);

        expect(result).toEqual(makeSuccessResponse([]));
        expect(mockTicketsRepository.findAllTicketsByOwner).toHaveBeenCalledWith(ticketOwner);
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const ticketOwner = 'user1';
        const error = new Error('Database error');
        mockTicketsRepository.findAllTicketsByOwner.mockRejectedValue(error);

        const result = await service.findAllByOwner(ticketOwner);

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
    describe('when ticket exists and user is owner', () => {
      it('should return the ticket with success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);

        const result = await service.findOne(ticketId, username, isAdmin);

        expect(result).toEqual(makeSuccessResponse(mockTicket));
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when ticket exists and user is admin', () => {
      it('should return the ticket with success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'admin';
        const isAdmin = true;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);

        const result = await service.findOne(ticketId, username, isAdmin);

        expect(result).toEqual(makeSuccessResponse(mockTicket));
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when ticket exists but user is not owner or admin', () => {
      it('should return forbidden error response', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user2';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);

        const result = await service.findOne(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'FORBIDDEN',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(undefined);

        const result = await service.findOne(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        const error = new Error('Database error');
        mockTicketsRepository.findOneTicket.mockRejectedValue(error);

        const result = await service.findOne(ticketId, username, isAdmin);

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
    describe('when ticket exists and user is owner', () => {
      it('should update the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
          severity: 2,
        };

        const existingTicket = { ...mockTicket };
        mockTicketsRepository.findOneTicket.mockResolvedValue(existingTicket);
        mockTicketsRepository.upsertOneTicket.mockResolvedValue(undefined);

        const result = await service.update(ticketId, updateTicketDto, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.upsertOneTicket).toHaveBeenCalled();
        expect(existingTicket.description).toBe('Updated Description');
        expect(existingTicket.severity).toBe(2);
        expect(existingTicket.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('when ticket exists and user is admin', () => {
      it('should update the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'admin';
        const isAdmin = true;
        const updateTicketDto: UpdateTicketDto = {
          resolved: true,
        };

        const existingTicket = { ...mockTicket };
        mockTicketsRepository.findOneTicket.mockResolvedValue(existingTicket);
        mockTicketsRepository.upsertOneTicket.mockResolvedValue(undefined);

        const result = await service.update(ticketId, updateTicketDto, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.upsertOneTicket).toHaveBeenCalled();
        expect(existingTicket.resolved).toBe(true);
        expect(existingTicket.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('when ticket exists but user is not owner or admin', () => {
      it('should return forbidden error response', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user2';
        const isAdmin = false;
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
        };

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);

        const result = await service.update(ticketId, updateTicketDto, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'FORBIDDEN',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.upsertOneTicket).not.toHaveBeenCalled();
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const username = 'user1';
        const isAdmin = false;
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
        };

        mockTicketsRepository.findOneTicket.mockResolvedValue(undefined);

        const result = await service.update(ticketId, updateTicketDto, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.upsertOneTicket).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;
        const updateTicketDto: UpdateTicketDto = {
          description: 'Updated Description',
        };

        const error = new Error('Database error');
        mockTicketsRepository.findOneTicket.mockRejectedValue(error);

        const result = await service.update(ticketId, updateTicketDto, username, isAdmin);

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
    describe('when ticket exists and user is owner', () => {
      it('should delete the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);
        mockTicketsRepository.deleteOneTicket.mockResolvedValue({
          Attributes: { id: { S: ticketId } },
        });

        const result = await service.remove(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.deleteOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when ticket exists and user is admin', () => {
      it('should delete the ticket and return success status', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'admin';
        const isAdmin = true;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);
        mockTicketsRepository.deleteOneTicket.mockResolvedValue({
          Attributes: { id: { S: ticketId } },
        });

        const result = await service.remove(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: true,
            data: null,
            statusCode: 200,
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.deleteOneTicket).toHaveBeenCalledWith(ticketId);
      });
    });

    describe('when ticket exists but user is not owner or admin', () => {
      it('should return forbidden error response', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user2';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(mockTicket);

        const result = await service.remove(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'FORBIDDEN',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.deleteOneTicket).not.toHaveBeenCalled();
      });
    });

    describe('when ticket does not exist', () => {
      it('should return not found error response', async () => {
        const ticketId = 'non-existent-id';
        const username = 'user1';
        const isAdmin = false;

        mockTicketsRepository.findOneTicket.mockResolvedValue(undefined);

        const result = await service.remove(ticketId, username, isAdmin);

        expect(result).toEqual(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
            }),
          }),
        );
        expect(mockTicketsRepository.findOneTicket).toHaveBeenCalledWith(ticketId);
        expect(mockTicketsRepository.deleteOneTicket).not.toHaveBeenCalled();
      });
    });

    describe('when repository throws an error', () => {
      it('should return error response with database error', async () => {
        const ticketId = '123e4567-e89b-12d3-a456-426614174000';
        const username = 'user1';
        const isAdmin = false;

        const error = new Error('Database error');
        mockTicketsRepository.findOneTicket.mockRejectedValue(error);

        const result = await service.remove(ticketId, username, isAdmin);

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
