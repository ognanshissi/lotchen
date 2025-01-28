import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import fs from 'node:fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.use(helmet());
  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('Talisoft.Lotchen.API')
    .setDescription('The Lotchen API description')
    .setVersion('1.0')
    .addTag('Lotchen-api')
    // .addServer(`http://localhost:${port}`, 'Local server http')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync(
    './libs/shared/api/src/assets/lotchen-swagger.json',
    JSON.stringify(document, null, 2),
    'utf8'
  );

  SwaggerModule.setup('swagger', app, document, {
    yamlDocumentUrl: 'swagger/yml',
  });
  app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
