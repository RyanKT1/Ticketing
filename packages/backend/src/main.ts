import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './errors/exception-filter';
import { Handler, Callback, Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;
async function bootstrap(): Promise<Handler> {
    const app = await NestFactory.create(AppModule);
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionFilter(httpAdapter));

    await app.init();
    app.enableCors({
        origin: process.env.CLOUDFRONT_DOMAIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'Origin', 'Accept'],
        exposedHeaders: ['Access-Control-Allow-Origin','Access-Control-Allow-Headers','Access-Control-Allow-Methods'],
        credentials: true,
        maxAge: 86400,
    });
    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) : Promise<APIGatewayProxyResult>=> {
    server = server ?? (await bootstrap());
    return server(event, context, callback);
};
