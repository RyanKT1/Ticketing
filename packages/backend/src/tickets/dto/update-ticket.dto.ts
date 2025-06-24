import { PartialType ,IntersectionType} from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsBoolean } from 'class-validator';

class AdditionalTicketInfo{
    @IsBoolean()
    resolved:boolean
}
export class UpdateTicketDto extends PartialType(IntersectionType(CreateTicketDto,AdditionalTicketInfo)) {
   
}
