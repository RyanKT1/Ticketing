import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Response } from 'express';
import { RequestWithUser } from 'src/helpers/auth.helper';
import { ApiGatewayAuthGuard } from '../auth/guards/api-gateway-auth.guard';
import { createCorsResponse } from '../helpers/cors.helper';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(ApiGatewayAuthGuard)
  async create(
    @Body(ValidationPipe) createTicketDto: CreateTicketDto,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const createTicketParams = {
      ...createTicketDto,
      ticketOwner: createTicketDto.ticketOwner || req.user.username,
    };
    const response = await this.ticketsService.create(createTicketParams);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Get()
  @UseGuards(ApiGatewayAuthGuard)
  async findAll(@Request() req: RequestWithUser, @Res() res: Response): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');

    let response;
    if (isAdmin) {
      response = await this.ticketsService.findAll();
    } else {
      response = await this.ticketsService.findAllByOwner(req.user.username);
    }

    return createCorsResponse(res, response.statusCode, response);
  }

  @Get(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');
    const response = await this.ticketsService.findOne(id, req.user.username, isAdmin);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Patch(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateTicketDto: UpdateTicketDto,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');
    const response = await this.ticketsService.update(
      id,
      updateTicketDto,
      req.user.username,
      isAdmin,
    );
    return createCorsResponse(res, response.statusCode, response);
  }

  @Delete(':id')
  @UseGuards(ApiGatewayAuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');
    const response = await this.ticketsService.remove(id, req.user.username, isAdmin);
    return createCorsResponse(res, response.statusCode, response);
  }
}
