import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { TicketsRepository } from './tickets.repository';
import type { Ticket } from './entities/ticket.entity';
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('TicketsRepository', () => {
  let repository: TicketsRepository;
  const ddbMock = mockClient(DynamoDBClient);

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

  const mockDynamoDbTicket = {
    id: { S: mockTicket.id },
    deviceId: { S: mockTicket.deviceId },
    deviceModel: { S: mockTicket.deviceModel },
    deviceManufacturer: { S: mockTicket.deviceManufacturer },
    title: { S: mockTicket.title },
    description: { S: mockTicket.description },
    ticketOwner: { S: mockTicket.ticketOwner },
    severity: { N: String(mockTicket.severity) },
    resolved: { BOOL: mockTicket.resolved },
    createdAt: { S: mockTicket.createdAt.toString() },
    updatedAt: { S: mockTicket.updatedAt.toString() },
  };

  beforeEach(async () => {
    ddbMock.reset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsRepository],
    }).compile();

    repository = module.get<TicketsRepository>(TicketsRepository);
  });

  describe('findAllTickets', () => {
    describe('when tickets exist', () => {
      it('should return an array of tickets', async () => {
        ddbMock.on(ScanCommand).resolves({
          Items: [mockDynamoDbTicket],
        });

        const result = await repository.findAllTickets();

        const scanCalls = ddbMock.commandCalls(ScanCommand);
        expect(scanCalls.length).toBe(1);
        expect(scanCalls[0].args[0].input.TableName).toBe('tickets');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(mockTicket.id);
        expect(result[0].deviceId).toBe(mockTicket.deviceId);
        expect(result[0].deviceModel).toBe(mockTicket.deviceModel);
        expect(result[0].deviceManufacturer).toBe(mockTicket.deviceManufacturer);
        expect(result[0].title).toBe(mockTicket.title);
        expect(result[0].description).toBe(mockTicket.description);
        expect(result[0].ticketOwner).toBe(mockTicket.ticketOwner);
        expect(result[0].severity).toBe(mockTicket.severity);
        expect(result[0].resolved).toBe(mockTicket.resolved);
      });
    });

    describe('when no tickets exist', () => {
      it('should return an empty array', async () => {
        ddbMock.on(ScanCommand).resolves({
          Items: [],
        });

        const result = await repository.findAllTickets();

        expect(result).toEqual([]);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findAllTickets()).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('findAllTicketsByOwner', () => {
    describe('when tickets exist for the owner', () => {
      it('should return an array of tickets for the owner', async () => {
        ddbMock.on(QueryCommand).resolves({
          Items: [mockDynamoDbTicket],
        });

        const result = await repository.findAllTicketsByOwner(mockTicket.ticketOwner);

        const queryCalls = ddbMock.commandCalls(QueryCommand);
        expect(queryCalls.length).toBe(1);
        expect(queryCalls[0].args[0].input.TableName).toBe('tickets');
        expect(queryCalls[0].args[0].input.IndexName).toBe('gsi');
        expect(queryCalls[0].args[0].input.KeyConditionExpression).toBe(
          'ticketOwner = :ticketOwnerValue',
        );
        expect(queryCalls[0].args[0].input.ExpressionAttributeValues).toEqual({
          ':ticketOwnerValue': { S: mockTicket.ticketOwner },
        });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(mockTicket.id);
        expect(result[0].ticketOwner).toBe(mockTicket.ticketOwner);
      });
    });

    describe('when no tickets exist for the owner', () => {
      it('should return an empty array', async () => {
        ddbMock.on(QueryCommand).resolves({
          Items: [],
        });

        const result = await repository.findAllTicketsByOwner('non-existent-owner');

        expect(result).toEqual([]);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findAllTicketsByOwner('any-owner')).rejects.toThrow(
          'DynamoDB error',
        );
      });
    });
  });

  describe('findOneTicket', () => {
    describe('when ticket exists', () => {
      it('should return the ticket', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: mockDynamoDbTicket,
        });

        const result = await repository.findOneTicket(mockTicket.id);

        const getCalls = ddbMock.commandCalls(GetItemCommand);
        expect(getCalls.length).toBe(1);
        expect(getCalls[0].args[0].input.TableName).toBe('tickets');
        expect(getCalls[0].args[0].input.Key).toEqual({
          id: { S: mockTicket.id },
        });

        expect(result).toBeDefined();
        if (result) {
          expect(result.id).toBe(mockTicket.id);
          expect(result.deviceId).toBe(mockTicket.deviceId);
          expect(result.deviceModel).toBe(mockTicket.deviceModel);
          expect(result.deviceManufacturer).toBe(mockTicket.deviceManufacturer);
          expect(result.title).toBe(mockTicket.title);
          expect(result.description).toBe(mockTicket.description);
          expect(result.ticketOwner).toBe(mockTicket.ticketOwner);
          expect(result.severity).toBe(mockTicket.severity);
          expect(result.resolved).toBe(mockTicket.resolved);
        }
      });
    });

    describe('when ticket does not exist', () => {
      it('should return undefined', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: undefined,
        });

        const result = await repository.findOneTicket('non-existent-id');

        expect(result).toBeUndefined();
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(GetItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findOneTicket('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('upsertOneTicket', () => {
    describe('when called with complete ticket data', () => {
      it('should successfully upsert the ticket', async () => {
        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneTicket(mockTicket as Ticket);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);
        expect(putCalls[0].args[0].input.TableName).toBe('tickets');
        expect(putCalls[0].args[0].input.Item).toEqual({
          id: { S: mockTicket.id },
          deviceId: { S: mockTicket.deviceId },
          deviceModel: { S: mockTicket.deviceModel },
          deviceManufacturer: { S: mockTicket.deviceManufacturer },
          title: { S: mockTicket.title },
          description: { S: mockTicket.description },
          ticketOwner: { S: mockTicket.ticketOwner },
          severity: { N: String(mockTicket.severity) },
          resolved: { BOOL: mockTicket.resolved },
          createdAt: { S: String(mockTicket.createdAt) },
          updatedAt: { S: String(mockTicket.updatedAt) },
        });
      });
    });

    describe('when called with partial ticket data', () => {
      it('should only include provided fields', async () => {
        const partialTicket = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Updated Description',
          severity: 2,
        } as Ticket;

        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneTicket(partialTicket);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);

        const item = putCalls[0].args[0].input.Item;
        expect(item).toEqual({
          id: { S: partialTicket.id },
          description: { S: partialTicket.description },
          severity: { N: String(partialTicket.severity) },
        });
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.upsertOneTicket(mockTicket as Ticket)).rejects.toThrow(
          'DynamoDB error',
        );
      });
    });
  });

  describe('deleteOneTicket', () => {
    describe('when ticket exists', () => {
      it('should return the delete command output', async () => {
        const mockResponse = {
          Attributes: { id: { S: mockTicket.id } },
          ConsumedCapacity: { TableName: 'tickets', CapacityUnits: 1 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneTicket(mockTicket.id);

        const deleteCalls = ddbMock.commandCalls(DeleteItemCommand);
        expect(deleteCalls.length).toBe(1);
        expect(deleteCalls[0].args[0].input.TableName).toBe('tickets');
        expect(deleteCalls[0].args[0].input.Key).toEqual({
          id: { S: mockTicket.id },
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when ticket does not exist', () => {
      it('should return the delete command output', async () => {
        const mockResponse = {
          ConsumedCapacity: { TableName: 'tickets', CapacityUnits: 0 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneTicket('non-existent-id');

        expect(result).toEqual(mockResponse);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(DeleteItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.deleteOneTicket('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });
});
