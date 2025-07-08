import { CreateMessageDto } from '../dto/create-message.dto';
import { v4 as uuidv4 } from 'uuid';

export class Message {
    id: string;
    ticketId: string;
    content: string;
    fileName: string;
    s3Link:string;
    sentBy:string;
    createdAt: Date;

    static createMessageInstanceFromDynamoDbObject(data: any): Message {
        const message = new Message();
        message.id = data.id?.S;
        message.ticketId = data.ticketId?.S;
        message.content = data.content?.S;
        message.sentBy = data.sentBy?.S;
        message.fileName = data.fileName?.S;
        message.createdAt = data.createdAt?.S;
        return message;
    }

    static createMessageInstanceFromTicketDto(createMessageDto: CreateMessageDto) {
        const message = new Message();
        message.id = uuidv4();
        message.ticketId = createMessageDto.ticketId;
        message.content = createMessageDto.content;
        message.fileName = createMessageDto.fileName;
        message.sentBy = createMessageDto.sentBy 
        message.createdAt = new Date();
        return message;
    }
}
