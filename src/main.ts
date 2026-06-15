import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : false,
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay campos extra
      transform: true,            // Convierte tipos automáticamente
    }),
  );

  // Serialización automática: excluye campos marcados con @Exclude()
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Ward E-commerce API')
    .setDescription('La API para la tienda online de perfumes Ward')
    .setVersion('1.0')
    .addBearerAuth() // Añade el botón para autenticar con JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();

