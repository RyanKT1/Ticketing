import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './errors/exception-filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionFilter(httpAdapter));
    app.enableCors();
    // to enable cors for everyone do app.enableCors()
    await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
