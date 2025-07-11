import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RequestContextProvider } from '../providers/request-context.provider';

@Injectable()
export class ApiGatewayAuthGuard implements CanActivate {
  constructor(private readonly requestContextProvider: RequestContextProvider) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      return true;
    }
    const authorizer = this.requestContextProvider.getAuthorizer();

    if (authorizer?.claims) {
      const claims = authorizer.claims;

      request.user = {
        userId: claims.sub || 'unknown',
        username: claims['cognito:username'] || claims.username || 'unknown',
        email: claims.email || 'unknown',
        groups: claims['cognito:groups'] || [],
      };
      return true;
    }

    console.error(
      'ApiGatewayAuthGuard - No user found in request and no authorizer claims available',
    );
    throw new UnauthorizedException('Authentication required');
  }
}
