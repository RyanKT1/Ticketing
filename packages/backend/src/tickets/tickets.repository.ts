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
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsRepository {
    private readonly tableName = 'tickets';
    private readonly region = 'eu-west-2';
    private dynamoDbClient: DynamoDBClient;
    constructor() {
        //ryantodo move this to a helper file and learn what catch does
        this.initialiseDynamoDbClient();
    }
    private initialiseDynamoDbClient() {
        this.dynamoDbClient = new DynamoDBClient({
            region: this.region,
        });
    }
    public async findAllTickets(): Promise<Ticket[]> {
        const ticketsList: Ticket[] = [];

        const command = new ScanCommand({
            TableName: this.tableName,
        });
        const response = await this.dynamoDbClient.send(command);

        if (response.Items) {
            response.Items.map(ticket => {
                ticketsList.push(Ticket.createTicketInstanceFromDynamoDbObject(ticket));
            });
        }
        return ticketsList;
    }

    public async upsertOneTicket(ticket: Ticket): Promise<PutItemCommandOutput> {
        // combination of both create and update method
        const ticketObject: Record<string, AttributeValue> = {
            id: {
                S: ticket.id,
            },
        };
        if (ticket.deviceName) {
            ticketObject.deviceName = {
                S: ticket.deviceName,
            };
        }
        if (ticket.ticketOwner) {
            ticketObject.ticketOwner = {
                S: ticket.ticketOwner,
            };
        }
        if (ticket.ticketDescription) {
            ticketObject.ticketDescription = {
                S: ticket.ticketDescription,
            };
        }
        if (ticket.updatedAt) {
            ticketObject.updatedAt = {
                S: String(ticket.updatedAt),
            };
        }
        if (ticket.createdAt) {
            ticketObject.createdAt = {
                S: String(ticket.createdAt),
            };
        }
        if (ticket.resolved) {
            ticketObject.resolved = {
                BOOL: Boolean(ticket.resolved),
            };
        }
         
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: ticketObject,
        });
        return await this.dynamoDbClient.send(command);
    }

    public async findOneTicket(id: string): Promise<Ticket | undefined> {
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
            return Ticket.createTicketInstanceFromDynamoDbObject(response.Item);
        }
        return undefined;
    }

    public async deleteOneTicket(id: string): Promise<DeleteItemCommandOutput> {
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
