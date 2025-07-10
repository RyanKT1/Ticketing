import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @Body() createMessageDto: CreateMessageDto, 
        @UploadedFile() file: Express.Multer.File, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        createMessageDto.sentBy = req.user.username;
        const response = await this.messagesService.create(createMessageDto, file, isAdmin);
        return res.status(response.statusCode).json(response);
    }

    @Get(':ticketId')
    @UseGuards(JwtAuthGuard)
    async findAllByTicketId(
        @Param('ticketId') ticketId: string, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        const response = await this.messagesService.findAll(ticketId, req.user.username, isAdmin);
        return res.status(response.statusCode).json(response);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param('id') id: string, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        const response = await this.messagesService.remove(id, req.user.username, isAdmin);
        return res.status(response.statusCode).json(response);
    }
}
