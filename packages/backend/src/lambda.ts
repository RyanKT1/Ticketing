import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './errors/exception-filter';
import type {
  Handler,
  Callback,
  Context,
  APIGatewayEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { RequestContextProvider } from './auth/providers/request-context.provider';

let server: Handler;
let requestContextProvider: RequestContextProvider;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(httpAdapter));
  await app.init();

  app.enableCors({
    origin: process.env.CLOUDFRONT_DOMAIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Origin', 'Accept'],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
    credentials: true,
    maxAge: 86400,
  });
  requestContextProvider = app.get(RequestContextProvider);

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  server = server ?? (await bootstrap());
  if (requestContextProvider) {
    requestContextProvider.setEvent(event);
  }

  return server(event, context, callback);
};
