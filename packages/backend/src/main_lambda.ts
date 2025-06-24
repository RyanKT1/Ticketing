import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './errors/exception-filter';
import { Handler, Callback, Context } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

let server: Handler;
async function bootstrap(): Promise<Handler> {
    const app = await NestFactory.create(AppModule);
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionFilter(httpAdapter));

    // to enable cors for everyone do app.enableCors()
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
    server = server ?? (await bootstrap());
    return server(event, context, callback);
};
