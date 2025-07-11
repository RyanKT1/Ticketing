import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MessagesRepository } from './message.repository';
import type { Message } from './entities/message.entity';
import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('MessagesRepository', () => {
  let repository: MessagesRepository;
  const ddbMock = mockClient(DynamoDBClient);

  const mockMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ticketId: '456e7890-e12d-34f5-a678-426614174000',
    content: 'Test Message Content',
    sentBy: 'user1',
    createdAt: new Date('2023-01-01'),
  };

  const mockDynamoDbMessage = {
    id: { S: mockMessage.id },
    ticketId: { S: mockMessage.ticketId },
    content: { S: mockMessage.content },
    sentBy: { S: mockMessage.sentBy },
    createdAt: { S: mockMessage.createdAt.toString() },
  };

  beforeEach(async () => {
    ddbMock.reset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesRepository],
    }).compile();

    repository = module.get<MessagesRepository>(MessagesRepository);
  });

  describe('findAllMessages', () => {
    describe('when messages exist for a ticket', () => {
      it('should return an array of messages', async () => {
        ddbMock.on(QueryCommand).resolves({
          Items: [mockDynamoDbMessage],
        });

        const result = await repository.findAllMessages(mockMessage.ticketId);

        const queryCalls = ddbMock.commandCalls(QueryCommand);
        expect(queryCalls.length).toBe(1);
        expect(queryCalls[0].args[0].input.TableName).toBe('messages');
        expect(queryCalls[0].args[0].input.IndexName).toBe('gsi');
        expect(queryCalls[0].args[0].input.KeyConditionExpression).toBe(
          'ticketId = :ticketIdValue',
        );
        expect(queryCalls[0].args[0].input.ExpressionAttributeValues).toEqual({
          ':ticketIdValue': { S: mockMessage.ticketId },
        });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(mockMessage.id);
        expect(result[0].ticketId).toBe(mockMessage.ticketId);
        expect(result[0].content).toBe(mockMessage.content);
        expect(result[0].sentBy).toBe(mockMessage.sentBy);
      });
    });

    describe('when no messages exist for a ticket', () => {
      it('should return an empty array', async () => {
        ddbMock.on(QueryCommand).resolves({
          Items: [],
        });

        const result = await repository.findAllMessages('non-existent-ticket-id');

        expect(result).toEqual([]);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findAllMessages('any-ticket-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('findOneMessage', () => {
    describe('when message exists', () => {
      it('should return the message', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: mockDynamoDbMessage,
        });

        const result = await repository.findOneMessage(mockMessage.id);

        const getCalls = ddbMock.commandCalls(GetItemCommand);
        expect(getCalls.length).toBe(1);
        expect(getCalls[0].args[0].input.TableName).toBe('messages');
        expect(getCalls[0].args[0].input.Key).toEqual({
          id: { S: mockMessage.id },
        });

        expect(result).toBeDefined();
        if (result) {
          expect(result.id).toBe(mockMessage.id);
          expect(result.ticketId).toBe(mockMessage.ticketId);
          expect(result.content).toBe(mockMessage.content);
          expect(result.sentBy).toBe(mockMessage.sentBy);
        }
      });
    });

    describe('when message does not exist', () => {
      it('should return undefined', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: undefined,
        });

        const result = await repository.findOneMessage('non-existent-id');

        expect(result).toBeUndefined();
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(GetItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findOneMessage('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('upsertOneMessage', () => {
    describe('when called with complete message data', () => {
      it('should successfully upsert the message', async () => {
        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneMessage(mockMessage as Message);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);
        expect(putCalls[0].args[0].input.TableName).toBe('messages');
        expect(putCalls[0].args[0].input.Item).toEqual({
          id: { S: mockMessage.id },
          ticketId: { S: mockMessage.ticketId },
          content: { S: mockMessage.content },
          sentBy: { S: mockMessage.sentBy },
          createdAt: { S: String(mockMessage.createdAt) },
        });
      });
    });

    describe('when called with partial message data', () => {
      it('should only include provided fields', async () => {
        const partialMessage = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Updated Content',
        } as Message;

        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneMessage(partialMessage);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);

        const item = putCalls[0].args[0].input.Item;
        expect(item).toEqual({
          id: { S: partialMessage.id },
          content: { S: partialMessage.content },
        });
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.upsertOneMessage(mockMessage as Message)).rejects.toThrow(
          'DynamoDB error',
        );
      });
    });
  });

  describe('deleteOneMessage', () => {
    describe('when message exists', () => {
      it('should return the delete command output', async () => {
        const mockResponse = {
          Attributes: { id: { S: mockMessage.id } },
          ConsumedCapacity: { TableName: 'messages', CapacityUnits: 1 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneMessage(mockMessage.id);

        const deleteCalls = ddbMock.commandCalls(DeleteItemCommand);
        expect(deleteCalls.length).toBe(1);
        expect(deleteCalls[0].args[0].input.TableName).toBe('messages');
        expect(deleteCalls[0].args[0].input.Key).toEqual({
          id: { S: mockMessage.id },
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when message does not exist', () => {
      it('should return the delete command output', async () => {
        const mockResponse = {
          ConsumedCapacity: { TableName: 'messages', CapacityUnits: 0 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneMessage('non-existent-id');

        expect(result).toEqual(mockResponse);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(DeleteItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.deleteOneMessage('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });
});
