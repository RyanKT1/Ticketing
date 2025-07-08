import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    create(@Body() createMessageDto: CreateMessageDto, @UploadedFile() file:Express.Multer.File, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        createMessageDto.sentBy = req.user.username;
        return this.messagesService.create(createMessageDto, file,isAdmin);
    }

    @Get(':ticketId')
    @UseGuards(JwtAuthGuard)
    findAllByTicketId(@Param('ticketId') ticketId: string, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        return this.messagesService.findAll(ticketId, req.user.username, isAdmin);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        return this.messagesService.remove(id, req.user.username, isAdmin);
    }
}
