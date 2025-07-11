import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './errors/exception-filter';

async function bootstrap() {
  // main.ts is used for dev
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(httpAdapter));
  app.enableCors('*');

  await app.listen(process.env.PORT ?? 3007);
}
bootstrap();
