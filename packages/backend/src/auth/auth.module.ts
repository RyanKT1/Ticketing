import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CognitoStrategy } from './strategies/cognito.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [CognitoStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
