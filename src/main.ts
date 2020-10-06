import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { SocialModule } from './social/social.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    SocialModule,
    new FastifyAdapter()
  );
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000, '0.0.0.0');
}

bootstrap();