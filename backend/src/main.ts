import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar CORS
  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  }));

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Servir archivos estáticos del frontend
  const frontendPath = join(__dirname, '..', '..', 'fronted', 'src');
  const publicPath = join(__dirname, '..', '..', 'fronted', 'public');

  app.useStaticAssets(publicPath);
  app.useStaticAssets(frontendPath, {
    prefix: '/src',
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req, res) => {
    res.sendFile(join(frontendPath, 'index.html'));
  });

  // Configurar prefijo global de API
  app.setGlobalPrefix('api-tienda');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación ejecutándose en mi servidor: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación de mi servidor:', err);
  process.exit(1);
});