//import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
    DynamoDBClient,
    ScanCommand,
    AttributeValue,
    PutItemCommand,
    DeleteItemCommand,
    GetItemCommand,
    PutItemCommandOutput,
    DeleteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Device } from './entity/device.entity';

@Injectable()
export class DevicesRepository {
    private readonly tableName = 'devices';
    private readonly region = 'eu-west-2';
    private readonly tableRoleArn = 'arn:aws:iam::020184830573:role/IibsAdminAccess-DO-NOT-DELETE';
    private dynamoDbClient: DynamoDBClient;
    constructor() {
        //ryantodo move this to a helper file and learn what catch does
        this.initialiseDynamoDbClient();
    }
    private async initialiseDynamoDbClient() {
        this.dynamoDbClient = new DynamoDBClient({
            region: this.region,
        });
    }
    public async findAllDevices(): Promise<Device[]> {
        const devicesList: Device[] = [];

        const command = new ScanCommand({
            TableName: this.tableName,
        });
        const response = await this.dynamoDbClient.send(command);

        if (response.Items) {
            // parse the result into an array and return it at devices
            response.Items.map(device => {
                devicesList.push(Device.createDeviceInstanceFromDynamoDbObject(device));
            });
        }
        return devicesList;
    }

    public async upsertOneDevice(device: Device): Promise<PutItemCommandOutput> {
        // combination of both create and update method
        const deviceObject: Record<string, AttributeValue> = {
            id: {
                S: device.id,
            },
        };
        if (device.manufacturer) {
            deviceObject.manufacturer = {
                S: device.manufacturer,
            };
        }
        if (device.model) {
            deviceObject.model = {
                S: device.model,
            };
        }
        if (device.name) {
            deviceObject.name = {
                S: device.name,
            };
        }
        if (device.updatedAt) {
            deviceObject.updatedAt = {
                S: String(device.updatedAt),
            };
        }
        if (device.createdAt) {
            deviceObject.createdAt = {
                S: String(device.createdAt),
            };
        }
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: deviceObject,
        });
        return await this.dynamoDbClient.send(command);
    }

    public async findOneDevice(id: string): Promise<Device | undefined> {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: {
                    S: id,
                },
            },
        });
        const response = await this.dynamoDbClient.send(command);
        if (response.Item) {
            return Device.createDeviceInstanceFromDynamoDbObject(response.Item);
        }
        return undefined;
    }

    public async deleteOneDevice(id: string):Promise<DeleteItemCommandOutput> {
        const command = new DeleteItemCommand({
            TableName: this.tableName,
            Key: {
                id: {
                    S: id,
                },
            },
            ReturnConsumedCapacity: 'TOTAL',
            ReturnValues: 'ALL_OLD',
        });
        return await this.dynamoDbClient.send(command);
       /* const result = await this.dynamoDbClient.send(command);
        if (result.Attributes) {
            return true;
        }
        // should throw error
        return false; // if nothing is returned that means item was not deleted*/
    }
}
