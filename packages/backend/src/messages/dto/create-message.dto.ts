import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  ticketId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  sentBy: string;
}
