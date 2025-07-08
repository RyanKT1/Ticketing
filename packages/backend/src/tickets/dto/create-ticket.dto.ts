import { IsString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateTicketDto {
    @IsString()
    @IsUUID()
    deviceId: string;

    @IsString()
    deviceManufacturer: string;

    @IsString()
    deviceModel: string;


    @IsString()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    severity:number

    @IsString()
    ticketOwner: string;
}
