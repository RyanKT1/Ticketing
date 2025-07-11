import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RequestContextProvider } from './providers/request-context.provider';

@Module({
  controllers: [AuthController],
  providers: [RequestContextProvider],
  exports: [RequestContextProvider],
})
export class AuthModule {}
