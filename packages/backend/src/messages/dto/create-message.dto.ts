import {IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateMessageDto {
    @IsUUID()
    @IsNotEmpty()
    ticketId:string

    @IsString()
    content:string

    @IsString()
    fileName: string;

    @IsString()
    sentBy: string;
}
