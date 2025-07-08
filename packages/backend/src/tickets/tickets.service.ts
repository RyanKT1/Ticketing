import { Injectable, Logger } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);
    constructor(private readonly ticketsRepository: TicketsRepository) {}
    create(createTicketDto: CreateTicketDto) {
        this.logger.log(`Creatomg new ticket`);
        const newTicket = {
            ...createTicketDto,
        };
        this.ticketsRepository.upsertOneTicket(Ticket.createTicketInstanceFromTicketDto(newTicket));
        return 'This action adds a new ticket';
    }

    async findAll():Promise<Ticket[]> {
        this.logger.log(`Retrieving all tickets`);
        const tickets = await this.ticketsRepository.findAllTickets();
        return tickets;
    }
    async findAllByOwner(ticketOwner:string):Promise<Ticket[]> {
        this.logger.log(`Retrieving all tickets by owner: ${ticketOwner}`);
        const tickets = await this.ticketsRepository.findAllTicketsByOwner(ticketOwner);
        return tickets;
    }

    async findOne(id: string, username: string, isAdmin: boolean): Promise<Ticket|boolean> {
        this.logger.log(`Retrieving ticket with id: ${id}`);
        const ticket = await this.ticketsRepository.findOneTicket(id);
        
        if (!ticket) {
          this.logger.log(`Ticket with id ${id} not found`)
            return false;
        }
        
        if (!isAdmin && ticket.ticketOwner !== username) {
          this.logger.log(`Not authorized to view ticket #${id}`)
            return false ;
        }
        
        return ticket;
    }

    async update(id: string, updateTicketDto: UpdateTicketDto, username: string, isAdmin: boolean):Promise<Boolean> {
        this.logger.log(`Updating ticket with id: ${id}`);
        const existingticket = await this.ticketsRepository.findOneTicket(id);
        
        if (!existingticket) {
          this.logger.log(`Ticket with id ${id} not found`)
            return false;
        }
        if (!isAdmin && existingticket.ticketOwner !== username) {
          this.logger.log(`Not authorized to update ticket #${id}`)
            return false;
        }
        
        if (existingticket) {
            if (updateTicketDto.deviceId) {
                existingticket.deviceId = updateTicketDto.deviceId;
            }
            if (updateTicketDto.deviceManufacturer) {
                existingticket.deviceManufacturer = updateTicketDto.deviceManufacturer;
            }
            if (updateTicketDto.deviceModel) {
                existingticket.deviceModel = updateTicketDto.deviceModel;
            }
            if (updateTicketDto.description) {
                existingticket.description = updateTicketDto.description;
            }
            if (updateTicketDto.severity) {
                existingticket.severity = updateTicketDto.severity;
            }
            if (updateTicketDto.resolved) {
                existingticket.resolved = updateTicketDto.resolved;
            }
            existingticket.updatedAt = new Date();
            this.ticketsRepository.upsertOneTicket(existingticket);
            this.logger.log(`Successfully updated ticket #${id}`)
            return true;
        }
        this.logger.log(`Failed to update ticket #${id}`)
        return false;
    }

    async remove(id: string, username: string, isAdmin: boolean):Promise<Boolean> {
        this.logger.log(`Deleting ticket with id: ${id}`);
        const ticket = await this.ticketsRepository.findOneTicket(id);
        if (!ticket) {
          this.logger.log(`Ticket with id ${id} not found`)
            return false;
        }
        if (isAdmin || ticket.ticketOwner === username) {
            this.ticketsRepository.deleteOneTicket(id);
            this.logger.log(`Successfully removed ticket #${id}`)
            return true;
        } else {
          this.logger.log(`Not authorized to delete ticket #${id}`)
            return false;
        }
    }
}
