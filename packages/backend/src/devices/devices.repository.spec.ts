import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DevicesRepository } from './devices.repository';
import type { Device } from './entity/device.entity';
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('DevicesRepository', () => {
  let repository: DevicesRepository;
  const ddbMock = mockClient(DynamoDBClient);

  const mockDevice = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Device',
    model: 'Test Model',
    manufacturer: 'Test Manufacturer',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockDynamoDbDevice = {
    id: { S: mockDevice.id },
    name: { S: mockDevice.name },
    model: { S: mockDevice.model },
    manufacturer: { S: mockDevice.manufacturer },
    createdAt: { S: mockDevice.createdAt.toString() },
    updatedAt: { S: mockDevice.updatedAt.toString() },
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    ddbMock.reset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesRepository],
    }).compile();

    repository = module.get<DevicesRepository>(DevicesRepository);
  });

  describe('findAll', () => {
    describe('when devices exist', () => {
      it('should return an array of devices', async () => {
        ddbMock.on(ScanCommand).resolves({
          Items: [mockDynamoDbDevice],
        });

        const result = await repository.findAll();

        const scanCalls = ddbMock.commandCalls(ScanCommand);
        expect(scanCalls.length).toBe(1);
        expect(scanCalls[0].args[0].input.TableName).toBe('devices');

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(mockDevice.id);
        expect(result[0].name).toBe(mockDevice.name);
        expect(result[0].model).toBe(mockDevice.model);
        expect(result[0].manufacturer).toBe(mockDevice.manufacturer);
      });
    });

    describe('when no devices exist', () => {
      it('should return an empty array', async () => {
        ddbMock.on(ScanCommand).resolves({
          Items: [],
        });

        const result = await repository.findAll();

        expect(result).toEqual([]);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findAll()).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('findOne', () => {
    describe('when device exists', () => {
      it('should return the device', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: mockDynamoDbDevice,
        });

        const result = await repository.findOne(mockDevice.id);

        const getCalls = ddbMock.commandCalls(GetItemCommand);
        expect(getCalls.length).toBe(1);
        expect(getCalls[0].args[0].input.TableName).toBe('devices');
        expect(getCalls[0].args[0].input.Key).toEqual({
          id: { S: mockDevice.id },
        });

        expect(result).toBeDefined();
        if (result) {
          expect(result.id).toBe(mockDevice.id);
          expect(result.name).toBe(mockDevice.name);
          expect(result.model).toBe(mockDevice.model);
          expect(result.manufacturer).toBe(mockDevice.manufacturer);
        }
      });
    });

    describe('when device does not exist', () => {
      it('should return undefined', async () => {
        ddbMock.on(GetItemCommand).resolves({
          Item: undefined,
        });

        const result = await repository.findOne('non-existent-id');

        expect(result).toBeUndefined();
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(GetItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.findOne('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });

  describe('upsertOneDevice', () => {
    describe('when called with complete device data', () => {
      it('should successfully upsert the device', async () => {
        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneDevice(mockDevice as Device);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);
        expect(putCalls[0].args[0].input.TableName).toBe('devices');
        expect(putCalls[0].args[0].input.Item).toEqual({
          id: { S: mockDevice.id },
          name: { S: mockDevice.name },
          model: { S: mockDevice.model },
          manufacturer: { S: mockDevice.manufacturer },
          createdAt: { S: String(mockDevice.createdAt) },
          updatedAt: { S: String(mockDevice.updatedAt) },
        });
      });
    });

    describe('when called with partial device data', () => {
      it('should only include provided fields', async () => {
        const partialDevice = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Partial Device',
        } as Device;

        ddbMock.on(PutItemCommand).resolves({});

        await repository.upsertOneDevice(partialDevice);

        const putCalls = ddbMock.commandCalls(PutItemCommand);
        expect(putCalls.length).toBe(1);

        const item = putCalls[0].args[0].input.Item;
        expect(item).toEqual({
          id: { S: partialDevice.id },
          name: { S: partialDevice.name },
        });
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(PutItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.upsertOneDevice(mockDevice as Device)).rejects.toThrow(
          'DynamoDB error',
        );
      });
    });
  });

  describe('deleteOneDevice', () => {
    describe('when device exists', () => {
      it('should return the delete command output', async () => {
        const mockResponse = {
          Attributes: { id: { S: mockDevice.id } },
          ConsumedCapacity: { TableName: 'devices', CapacityUnits: 1 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneDevice(mockDevice.id);

        const deleteCalls = ddbMock.commandCalls(DeleteItemCommand);
        expect(deleteCalls.length).toBe(1);
        expect(deleteCalls[0].args[0].input.TableName).toBe('devices');
        expect(deleteCalls[0].args[0].input.Key).toEqual({
          id: { S: mockDevice.id },
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when device does not exist', () => {
      it('should return the delete command output', async () => {
        // Mock delete response without attributes
        const mockResponse = {
          ConsumedCapacity: { TableName: 'devices', CapacityUnits: 0 },
        };

        ddbMock.on(DeleteItemCommand).resolves(mockResponse);

        const result = await repository.deleteOneDevice('non-existent-id');

        expect(result).toEqual(mockResponse);
      });
    });

    describe('when DynamoDB throws an error', () => {
      it('should propagate the error', async () => {
        ddbMock.on(DeleteItemCommand).rejects(new Error('DynamoDB error'));

        await expect(repository.deleteOneDevice('any-id')).rejects.toThrow('DynamoDB error');
      });
    });
  });
});
