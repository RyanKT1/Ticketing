import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  deviceId: string;

  @IsOptional()
  @IsString()
  deviceManufacturer: string;

  @IsOptional()
  @IsString()
  deviceModel: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  severity: number;

  @IsOptional()
  @IsString()
  ticketOwner: string;
}
