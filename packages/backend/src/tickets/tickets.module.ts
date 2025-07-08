import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';

@Module({
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository],
    exports: [TicketsService], 
})
export class TicketsModule {}
