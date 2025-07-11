import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestContextProvider {
  private event: any;

  setEvent(event: any) {
    this.event = event;
  }

  getAuthorizer() {
    return this.event?.requestContext?.authorizer;
  }

  getIdentity() {
    return this.event?.requestContext?.identity;
  }
}
