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
import { DeleteObjectCommand, DeleteObjectCommandOutput, PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MessagesRepository {
    private readonly tableName = 'messages';
    private readonly region = 'eu-west-2';
    private readonly bucketName = 'beta-TicketingMessageBucket'
    private dynamoDbClient: DynamoDBClient;
    private s3Client :S3Client
    constructor() {
        //ryantodo move this to a helper file and learn what catch does
        this.initialiseDynamoDbClient();
        this.initialiseS3Client()
    }
    private initialiseDynamoDbClient() {
        this.dynamoDbClient = new DynamoDBClient({
            region: this.region,
        });
    }
    private initialiseS3Client() {
        this.s3Client = new S3Client({
        });
    }
    public async findAllMessages(ticketId:string): Promise<Message[]> {
        const messagesList: Message[] = [];

        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName:'ticketId',
            KeyConditionExpression:`ticketId = :${ticketId}`

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
        }
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
        if (message.fileName) {
            messageObject.fileName = {
                S: message.fileName,
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
        /* const result = await this.dynamoDbClient.send(command);
        if (result.Attributes) {
            return true;
        }
        // should throw error
        return false; // if nothing is returned that means item was not deleted*/
    }
    public async deleteAttachment(filePath:string):Promise<DeleteObjectCommandOutput>{
        const command = new DeleteObjectCommand({
            Bucket:this.bucketName,
            Key:filePath
        })
        return await this.s3Client.send(command)
    }
    public async uploadAttachment(filePath:string,file:Express.Multer.File):Promise<PutObjectCommandOutput>{
        const command = new PutObjectCommand({
            Body:file.buffer,
            Bucket:this.bucketName,
            Key:filePath
        })
        return await this.s3Client.send(command)
    }
    public async getAttachmentLink(filePath:string):Promise<string>{
         const command = new PutObjectCommand({
            Bucket:this.bucketName,
            Key:filePath
        })
        return getSignedUrl(this.s3Client,command,{expiresIn:3600})
    }
}
