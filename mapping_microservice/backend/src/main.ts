import { NestFactory }            from '@nestjs/core';
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});
  await app.listen(3001);
}

bootstrap();

// http://localhost:3001
// http://localhost:3002 - mapa
