import { CreateDeviceDto } from "./create-device-dto";
import { PartialType } from "@nestjs/mapped-types"

export class UpdateDeviceDto extends PartialType(CreateDeviceDto){
}