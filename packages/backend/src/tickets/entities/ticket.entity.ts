import { CreateTicketDto } from '../dto/create-ticket.dto';
import { v4 as uuidv4 } from 'uuid';

export class Ticket {
    id: string;
    deviceName: string;
    ticketDescription: string;
    ticketOwner: string;
    createdAt: Date;
    updatedAt: Date;
    resolved:Boolean

    static createTicketInstanceFromDynamoDbObject(data: any): Ticket {
        const ticket = new Ticket();
        ticket.id = data.id?.S;
        ticket.deviceName = data.deviceName?.S;
        ticket.ticketDescription = data.ticketDescription?.S;
        ticket.ticketOwner = data.ticketOwner?.S;
        ticket.createdAt = data.createdAt?.S;
        ticket.updatedAt = data.updatedAt?.S;
        ticket.resolved = data.resolved?.S;
        return ticket;
    }

    static createTicketInstanceFromTicketDto(createTicketDto: CreateTicketDto) {
        const ticket = new Ticket();
        ticket.id = uuidv4();
        ticket.deviceName = createTicketDto.deviceName;
        ticket.ticketDescription = createTicketDto.ticketDescription;
        ticket.ticketOwner = createTicketDto.ticketOwner;
        ticket.createdAt = new Date();
        ticket.updatedAt = new Date();
        ticket.resolved = false
        return ticket;
    }
}
/*
id
title
device
createdAt
UpdatedAt
Ticket Description
ticket owner 
directed team
resolved

id
ticket id
message
createdat 
updatedAt 
edited?
attachment? link to download attachment
idea of attachment might cause owasp problem be careful,

limitations are :
ticket updates messages - array maybe , could have limit per item, maybe nested table then 
 attachments
if we do nested ticket table then we have 3 tables and can use cognito
if we use s3/efs , how would that be accessed
also why do we need api in first pklace whats stops direct access to db or s3
*/