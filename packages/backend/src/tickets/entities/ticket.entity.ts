import type { CreateTicketDto } from '../dto/create-ticket.dto';
import { v4 as uuidv4 } from 'uuid';

export class Ticket {
  id: string;
  deviceId: string;
  deviceModel: string;
  deviceManufacturer: string;
  title: string;
  description: string;
  ticketOwner: string;
  createdAt: Date;
  updatedAt: Date;
  severity: number;
  resolved: boolean;

  static createTicketInstanceFromDynamoDbObject(data: any): Ticket {
    const ticket = new Ticket();
    ticket.id = data.id?.S;
    ticket.deviceId = data.deviceId?.S;
    ticket.deviceModel = data.deviceModel?.S;
    ticket.deviceManufacturer = data.deviceManufacturer?.S;
    ticket.title = data.title?.S;
    ticket.description = data.description?.S;
    ticket.ticketOwner = data.ticketOwner?.S;
    ticket.createdAt = data.createdAt?.S;
    ticket.updatedAt = data.updatedAt?.S;
    ticket.severity = data.severity?.N ? Number(data.severity.N) : data.severity?.N;
    ticket.resolved = data.resolved?.BOOL;
    return ticket;
  }

  static createTicketInstanceFromTicketDto(createTicketDto: CreateTicketDto) {
    const ticket = new Ticket();
    ticket.id = uuidv4();
    ticket.deviceId = createTicketDto.deviceId;
    ticket.deviceModel = createTicketDto.deviceModel;
    ticket.deviceManufacturer = createTicketDto.deviceManufacturer;
    ticket.title = createTicketDto.title;
    ticket.description = createTicketDto.description;
    ticket.ticketOwner = createTicketDto.ticketOwner;
    ticket.severity = createTicketDto.severity;
    ticket.createdAt = new Date();
    ticket.updatedAt = new Date();
    ticket.resolved = false;
    return ticket;
  }
}
