import {
  DynamoDBClient,
  AttributeValue,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommandOutput,
  DeleteItemCommandOutput,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesRepository {
  private readonly tableName = 'messages';
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
  public async findAllMessages(ticketId: string): Promise<Message[]> {
    const messagesList: Message[] = [];

    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi',
      KeyConditionExpression: 'ticketId = :ticketIdValue',
      ExpressionAttributeValues: {
        ':ticketIdValue': { S: ticketId },
      },
    });
    const response = await this.dynamoDbClient.send(command);

    if (response.Items) {
      response.Items.map(message => {
        messagesList.push(Message.createMessageInstanceFromDynamoDbObject(message));
      });
    }
    return messagesList;
  }

  public async upsertOneMessage(message: Message): Promise<PutItemCommandOutput> {
    // combination of both create and update method
    const messageObject: Record<string, AttributeValue> = {
      id: {
        S: message.id,
      },
    };
    if (message.ticketId) {
      messageObject.ticketId = {
        S: message.ticketId,
      };
    }
    if (message.content) {
      messageObject.content = {
        S: message.content,
      };
    }
    if (message.sentBy) {
      messageObject.sentBy = {
        S: message.sentBy,
      };
    }
    if (message.createdAt) {
      messageObject.createdAt = {
        S: String(message.createdAt),
      };
    }
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: messageObject,
    });
    return await this.dynamoDbClient.send(command);
  }

  public async findOneMessage(id: string): Promise<Message | undefined> {
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
      return Message.createMessageInstanceFromDynamoDbObject(response.Item);
    }
    return undefined;
  }

  public async deleteOneMessage(id: string): Promise<DeleteItemCommandOutput> {
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
