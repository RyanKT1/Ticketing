import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    deviceName: string;

    @IsString()
    ticketDescription: string;

    @IsString()
    @IsNotEmpty()
    ticketOwner: string;
}