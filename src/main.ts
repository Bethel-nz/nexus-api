import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './utils/env';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Nexus API')
    .setDescription('API documentation for the Nexus order management system')
    .setVersion('1.0')
    .addTag('orders', 'Order management endpoints')
    .addTag('chat', 'Real-time chat functionality')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `API Documentation available at: http://localhost:${port}/api-docs`
  );
  logger.log(`Metrics available at: http://localhost:${port}/metrics`);
}
bootstrap();
