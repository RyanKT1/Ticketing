import { Injectable, Logger } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';
import {
  makeSuccessResponse,
  makeErrorResponse,
  SuccessResponse,
  ErrorResponse,
  ErrorCode,
  ErrorTypes,
  HttpStatus,
} from '../helpers/response.helper';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async create(createTicketDto: CreateTicketDto): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Creating new ticket`);
      const newTicket = {
        ...createTicketDto,
      };
      await this.ticketsRepository.upsertOneTicket(
        Ticket.createTicketInstanceFromTicketDto(newTicket),
      );
      return makeSuccessResponse(null, HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(`Failed to create ticket: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to create ticket');
    }
  }

  async findAll(): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Retrieving all tickets`);
      const tickets = await this.ticketsRepository.findAllTickets();
      return makeSuccessResponse(tickets);
    } catch (error) {
      this.logger.error(`Failed to retrieve tickets: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to retrieve tickets');
    }
  }

  async findAllByOwner(ticketOwner: string): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Retrieving all tickets by owner: ${ticketOwner}`);
      const tickets = await this.ticketsRepository.findAllTicketsByOwner(ticketOwner);
      return makeSuccessResponse(tickets);
    } catch (error) {
      this.logger.error(`Failed to retrieve tickets by owner: ${error.message}`);
      return makeErrorResponse(
        ErrorTypes[ErrorCode.DATABASE_ERROR],
        'Failed to retrieve tickets by owner',
      );
    }
  }

  async findOne(
    id: string,
    username: string,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Retrieving ticket with id: ${id}`);
      const ticket = await this.ticketsRepository.findOneTicket(id);

      if (!ticket) {
        this.logger.log(`Ticket with id ${id} not found`);
        return makeErrorResponse(ErrorTypes[ErrorCode.NOT_FOUND], `Ticket with id ${id} not found`);
      }

      if (!isAdmin && ticket.ticketOwner !== username) {
        this.logger.log(`Not authorized to view ticket #${id}`);
        return makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You are not authorized to view this ticket',
        );
      }

      return makeSuccessResponse(ticket);
    } catch (error) {
      this.logger.error(`Failed to retrieve ticket: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to retrieve ticket');
    }
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    username: string,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Updating ticket with id: ${id}`);
      const existingTicket = await this.ticketsRepository.findOneTicket(id);

      if (!existingTicket) {
        this.logger.log(`Ticket with id ${id} not found`);
        return makeErrorResponse(ErrorTypes[ErrorCode.NOT_FOUND], `Ticket with id ${id} not found`);
      }

      if (!isAdmin && existingTicket.ticketOwner !== username) {
        this.logger.log(`Not authorized to update ticket #${id}`);
        return makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You are not authorized to update this ticket',
        );
      }

      if (updateTicketDto.deviceId) {
        existingTicket.deviceId = updateTicketDto.deviceId;
      }
      if (updateTicketDto.deviceManufacturer) {
        existingTicket.deviceManufacturer = updateTicketDto.deviceManufacturer;
      }
      if (updateTicketDto.deviceModel) {
        existingTicket.deviceModel = updateTicketDto.deviceModel;
      }
      if (updateTicketDto.title) {
        existingTicket.title = updateTicketDto.title;
      }
      if (updateTicketDto.description) {
        existingTicket.description = updateTicketDto.description;
      }
      if (updateTicketDto.severity) {
        existingTicket.severity = updateTicketDto.severity;
      }
      if (updateTicketDto.resolved !== undefined) {
        existingTicket.resolved = updateTicketDto.resolved;
      }
      existingTicket.updatedAt = new Date();

      await this.ticketsRepository.upsertOneTicket(existingTicket);
      this.logger.log(`Successfully updated ticket #${id}`);
      return makeSuccessResponse();
    } catch (error) {
      this.logger.error(`Failed to update ticket: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to update ticket');
    }
  }

  async remove(
    id: string,
    username: string,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Deleting ticket with id: ${id}`);
      const ticket = await this.ticketsRepository.findOneTicket(id);

      if (!ticket) {
        this.logger.log(`Ticket with id ${id} not found`);
        return makeErrorResponse(ErrorTypes[ErrorCode.NOT_FOUND], `Ticket with id ${id} not found`);
      }

      if (!isAdmin && ticket.ticketOwner !== username) {
        this.logger.log(`Not authorized to delete ticket #${id}`);
        return makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You are not authorized to delete this ticket',
        );
      }

      await this.ticketsRepository.deleteOneTicket(id);
      this.logger.log(`Successfully removed ticket #${id}`);
      return makeSuccessResponse();
    } catch (error) {
      this.logger.error(`Failed to delete ticket: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to delete ticket');
    }
  }
}
