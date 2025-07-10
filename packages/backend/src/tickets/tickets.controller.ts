import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ValidationPipe, UseGuards, Request, Res } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body(ValidationPipe) createTicketDto: CreateTicketDto, 
        @Request() req,
        @Res() res: Response
    ) {
        const createTicketParams = {
            ...createTicketDto,
            ticketOwner: createTicketDto.ticketOwner || req.user.username,
        };
        const response = await this.ticketsService.create(createTicketParams);
        return res.status(response.statusCode).json(response);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Request() req, @Res() res: Response) {
        const isAdmin = req.user.groups.includes('Admins');
        
        let response;
        if (isAdmin) {
            response = await this.ticketsService.findAll();
        } else {
            response = await this.ticketsService.findAllByOwner(req.user.username);
        }
        
        return res.status(response.statusCode).json(response);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(
        @Param('id', ParseUUIDPipe) id: string, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        const response = await this.ticketsService.findOne(id, req.user.username, isAdmin);
        return res.status(response.statusCode).json(response);
    }
 
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body(ValidationPipe) updateTicketDto: UpdateTicketDto, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        const response = await this.ticketsService.update(id, updateTicketDto, req.user.username, isAdmin);
        return res.status(response.statusCode).json(response);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param('id', ParseUUIDPipe) id: string, 
        @Request() req,
        @Res() res: Response
    ) {
        const isAdmin = req.user.groups.includes('Admins');
        const response = await this.ticketsService.remove(id, req.user.username, isAdmin);
        return res.status(response.statusCode).json(response);
    }
}
