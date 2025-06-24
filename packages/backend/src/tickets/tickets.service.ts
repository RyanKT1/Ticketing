import { Injectable, Logger } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name)
  constructor(private readonly ticketsRepository: TicketsRepository){}
  create(createTicketDto: CreateTicketDto) {
    this.logger.log(`Creatomg new ticket`)
    const newTicket = {
      ...createTicketDto
    }
    this.ticketsRepository.upsertOneTicket(Ticket.createTicketInstanceFromTicketDto(newTicket))
    return 'This action adds a new ticket';
  }

  async findAll() {
    this.logger.log(`Retrieving all tickets`);
    const tickets = await this.ticketsRepository.findAllTickets();
    return `This action returns all tickets`;
  }

  async findOne(id: string) {
    this.logger.log(`Retrieving This with id: ${id}`);
    const ticket = await this.ticketsRepository.findOneTicket(id);
    return `This action returns a #${id} ticket`;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    this.logger.log(`Updating ticket with id: ${id}`);
    const existingticket = await this.ticketsRepository.findOneTicket(id);
    if (existingticket){
      if(updateTicketDto.deviceName){
        existingticket.deviceName = updateTicketDto.deviceName
      }
      if(updateTicketDto.ticketOwner){
        existingticket.ticketOwner = updateTicketDto.ticketOwner
      }
      if(updateTicketDto.ticketDescription){
        existingticket.ticketDescription = updateTicketDto.ticketDescription
      }
      if(updateTicketDto.resolved){
        existingticket.resolved = updateTicketDto.resolved
      }
      existingticket.updatedAt = new Date()
      this.ticketsRepository.upsertOneTicket(existingticket)
    }
    return `This action updates a #${id} ticket`;
  }

  remove(id: string) {
    this.logger.log(`Deleting ticket with id: ${id}`);
    this.ticketsRepository.deleteOneTicket(id);
    return `This action removes a #${id} ticket`;
  }
}
