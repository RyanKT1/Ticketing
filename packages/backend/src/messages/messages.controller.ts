import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Response } from 'express';
import { RequestWithUser } from 'src/helpers/auth.helper';
import { ApiGatewayAuthGuard } from '../auth/guards/api-gateway-auth.guard';
import { createCorsResponse } from '../helpers/cors.helper';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(ApiGatewayAuthGuard)
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');
    createMessageDto.sentBy = req.user.username;
    const response = await this.messagesService.create(createMessageDto, isAdmin);
    return createCorsResponse(res, response.statusCode, response);
  }

  @Get(':ticketId')
  @UseGuards(ApiGatewayAuthGuard)
  async findAllByTicketId(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const isAdmin = req.user.groups.includes('Admins');
    const response = await this.messagesService.findAll(ticketId, req.user.username, isAdmin);
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
    const response = await this.messagesService.remove(id, req.user.username, isAdmin);
    return createCorsResponse(res, response.statusCode, response);
  }
}
