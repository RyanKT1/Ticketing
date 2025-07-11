import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesRepository } from './message.repository';
import { Message } from './entities/message.entity';
import { TicketsService } from '../tickets/tickets.service';
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
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly ticketsService: TicketsService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const ticketResponse = await this.ticketsService.findOne(
        createMessageDto.ticketId,
        createMessageDto.sentBy,
        isAdmin,
      );

      if (!ticketResponse.success) {
        return ticketResponse;
      }

      this.logger.log(`Creating new message`);
      const newMessage = {
        ...createMessageDto,
      };

      await this.messagesRepository.upsertOneMessage(
        Message.createMessageInstanceFromTicketDto(newMessage),
      );

      this.logger.log('Created message');
      return makeSuccessResponse(null, HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(`Failed to create message: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to create message');
    }
  }

  async findAll(
    ticketId: string,
    username: string,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Retrieving all messages for ticket: ${ticketId}`);

      const ticketResponse = await this.ticketsService.findOne(ticketId, username, isAdmin);

      if (!ticketResponse.success) {
        return ticketResponse;
      }

      const messages = await this.messagesRepository.findAllMessages(ticketId);

      return makeSuccessResponse(messages);
    } catch (error) {
      this.logger.error(`Failed to retrieve messages: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to retrieve messages');
    }
  }

  async remove(
    id: string,
    username: string,
    isAdmin: boolean,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      this.logger.log(`Deleting message with id: ${id}`);
      const message = await this.messagesRepository.findOneMessage(id);

      if (!message) {
        this.logger.log(`Message with id ${id} not found`);
        return makeErrorResponse(
          ErrorTypes[ErrorCode.NOT_FOUND],
          `Message with id ${id} not found`,
        );
      }

      if (!isAdmin && message.sentBy !== username) {
        this.logger.log(`Not authorized to delete message #${id}`);
        return makeErrorResponse(
          ErrorTypes[ErrorCode.FORBIDDEN],
          'You are not authorized to delete this message',
        );
      }

      await this.messagesRepository.deleteOneMessage(id);
      this.logger.log(`Successfully removed message #${id}`);
      return makeSuccessResponse();
    } catch (error) {
      this.logger.error(`Failed to delete message: ${error.message}`);
      return makeErrorResponse(ErrorTypes[ErrorCode.DATABASE_ERROR], 'Failed to delete message');
    }
  }
}
