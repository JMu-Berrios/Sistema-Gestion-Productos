

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
  origin: process.env.ORIGEN_CORS || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
});

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Servir archivos estáticos del frontend
  const frontendPath = join(__dirname, '..', '..', 'frontend', 'src');
  const publicPath = join(__dirname, '..', '..', 'frontend', 'public');
  console.log('Frontend path:', frontendPath);

  app.useStaticAssets(publicPath);
  app.useStaticAssets(frontendPath, {
    prefix: '/src',
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req, res) => {
    res.sendFile(join(frontendPath, 'index.html'));
  });

  // Configurar prefijo global de API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación ejecutándose en mi servidor: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación de mi servidor:', err);
  process.exit(1);
});