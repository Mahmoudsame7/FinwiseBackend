import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger, logger2 } from './Utilities/Logger';

// import { HttpExceptionFilter } from './Utilities/HttpExceptionFilter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // app.use(logger);
  // app.use(logger2);

  // app.useGlobalFilters(new HttpExceptionFilter());
  
  // await app.listen(process.env.PORT ?? 3000);

  const port = process.env.PORT || 8080;

  await app.listen(port, '0.0.0.0');
  
}
bootstrap();
