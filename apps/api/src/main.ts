import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { RealtimeAuthAdapter } from './modules/realtime/realtime-auth.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Usar Pino como logger de NestJS (reemplaza console.log en todo el framework)
  app.useLogger(app.get(PinoLogger));

  // WebSocket adapter for Socket.io with custom auth
  app.useWebSocketAdapter(new RealtimeAuthAdapter(app));

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Server running on port ${port}`);
}
bootstrap();
