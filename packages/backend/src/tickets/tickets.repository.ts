import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommandOutput,
  DeleteItemCommandOutput,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsRepository {
  private readonly tableName = 'tickets';
  private readonly region = 'eu-west-2';
  private dynamoDbClient: DynamoDBClient;
  constructor() {
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

  public async findAllTicketsByOwner(ticketOwner: string): Promise<Ticket[]> {
    const ticketsList: Ticket[] = [];

    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi',
      KeyConditionExpression: 'ticketOwner = :ticketOwnerValue',
      ExpressionAttributeValues: {
        ':ticketOwnerValue': { S: ticketOwner },
      },
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
    if (ticket.deviceId) {
      ticketObject.deviceId = {
        S: ticket.deviceId,
      };
    }
    if (ticket.deviceManufacturer) {
      ticketObject.deviceManufacturer = {
        S: ticket.deviceManufacturer,
      };
    }
    if (ticket.deviceModel) {
      ticketObject.deviceModel = {
        S: ticket.deviceModel,
      };
    }
    if (ticket.title) {
      ticketObject.title = {
        S: ticket.title,
      };
    }
    if (ticket.description) {
      ticketObject.description = {
        S: ticket.description,
      };
    }
    if (ticket.ticketOwner) {
      ticketObject.ticketOwner = {
        S: ticket.ticketOwner,
      };
    }

    if (ticket.severity) {
      ticketObject.severity = {
        N: String(ticket.severity),
      };
    }

    if (ticket.resolved !== undefined) {
      ticketObject.resolved = {
        BOOL: Boolean(ticket.resolved),
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
  }
}
