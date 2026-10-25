import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  console.log('DB host:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);

  app.enableCors();
  await app.init();
}

export default async function handler(req: any, res: any) {
  ready = ready ?? bootstrap();
  await ready;
  server(req, res);
}