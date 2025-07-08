import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesRepository } from './message.repository';
import { Message } from './entities/message.entity';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);
    constructor(
        private readonly messagesRepository: MessagesRepository,
        private readonly ticketsService: TicketsService
    ) {}

    async create(createMessageDto: CreateMessageDto,file:Express.Multer.File, isAdmin: boolean):Promise<Boolean> {
        const ticket = await this.ticketsService.findOne(createMessageDto.ticketId, createMessageDto.sentBy, isAdmin);

        if (!ticket) {
            return ticket;
        }

        this.logger.log(`Creating new message`);
        const newMessage = {
            ...createMessageDto,
        };
        this.messagesRepository.upsertOneMessage(Message.createMessageInstanceFromTicketDto(newMessage));
        this.messagesRepository.uploadAttachment(`${newMessage.ticketId}/${newMessage.fileName}`,file)
        this.logger.log('Created Ticket')
        return true;
    }
 
    
    async findAll(ticketId: string, username: string, isAdmin: boolean) :Promise<Message[]|Boolean> {
        this.logger.log(`Retrieving all messages for ticket: ${ticketId}`);
        
    
        const ticket = await this.ticketsService.findOne(ticketId, username, isAdmin);
        
        if (!ticket) {
            return ticket
        }
        
        const messages = await this.messagesRepository.findAllMessages(ticketId);
        
        messages.map(async (message) => {
            if (message.fileName) {
                message.s3Link = await this.messagesRepository.getAttachmentLink(`${message.ticketId}/${message.fileName}`);
            }
        });
        
        return messages;
    }

    async remove(id: string, username: string, isAdmin: boolean): Promise<Boolean> {
        this.logger.log(`Deleting message with id: ${id}`);
        const message = await this.messagesRepository.findOneMessage(id);
        
        if (!message) {
            this.logger.log(`Message with id ${id} not found`)
            return false;
        }
        
        if (isAdmin || message.sentBy === username) {
            if (message.fileName) {
                await this.messagesRepository.deleteAttachment(`${message.ticketId}/${message.fileName}`);
            }
            this.messagesRepository.deleteOneMessage(id);
            this.logger.log(`Successfully removed message #${id}`)
            return true;
        } else {
            this.logger.log(`Not authorized to delete message #${id}`)
            return false ;
        }
    }
}
