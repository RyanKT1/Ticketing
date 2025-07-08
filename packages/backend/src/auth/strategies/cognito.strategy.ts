import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID || '';
    const clientId = process.env.COGNITO_APP_CLIENT_ID || '';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: clientId,
      issuer: `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      username: payload['cognito:username'],
      email: payload.email,
      groups: payload['cognito:groups'] || [],
    };
  }
}
