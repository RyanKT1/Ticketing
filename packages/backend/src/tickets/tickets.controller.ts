import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body(ValidationPipe) createTicketDto: CreateTicketDto, @Request() req) {
        const createTicketParams = {
            ...createTicketDto,
            ticketOwner: createTicketDto.ticketOwner || req.user.username,
        };
        return this.ticketsService.create(createTicketParams);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        
        if (isAdmin) {
            return this.ticketsService.findAll();
        } else {
            return this.ticketsService.findAllByOwner(req.user.username);
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        return this.ticketsService.findOne(id, req.user.username, isAdmin);
    }
 
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateTicketDto: UpdateTicketDto, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        return this.ticketsService.update(id, updateTicketDto, req.user.username, isAdmin);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        const isAdmin = req.user.groups.includes('Admins');
        return this.ticketsService.remove(id, req.user.username, isAdmin);
    }
}
