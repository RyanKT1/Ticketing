import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ApiGatewayAuthGuard } from './guards/api-gateway-auth.guard';

@Controller('auth')
export class AuthController {
  @Get('profile')
  @UseGuards(ApiGatewayAuthGuard)
  getProfile(@Request() req) {
    return {
      userId: req.user.userId,
      username: req.user.username,
      email: req.user.email,
      groups: req.user.groups,
    };
  }

  @Get('admin')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles('Admins')
  adminOnly(@Request() req) {
    return {
      message: 'This is an admin-only endpoint',
      user: req.user,
    };
  }

  @Get('user')
  @UseGuards(ApiGatewayAuthGuard, RolesGuard)
  @Roles('Admins')
  userOnly(@Request() req) {
    return {
      message: 'This is a user-only endpoint',
      user: req.user,
    };
  }
}
