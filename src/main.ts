import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appPort } from './config';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { json } from 'express';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { VehicleSeeder } from './modules/vehicle/vehicle.seeder';
import { UserSeeder } from './modules/user/user.seeder';
import { ExceptionsFilter } from './common/filter/exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(helmet());
  // app.use(morgan('tiny'));
  app.use(json({ limit: '100kb' }));
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ExceptionsFilter());

  // Apply ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Autochek API')
    .setDescription('Autochek Backend API')
    .setVersion('1.0')
    .addTag('autochek-api')
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
    extraModels: [],
  });
  SwaggerModule.setup('api/v1/docs', app, document);

  // seed record to db
  const vehicleSeeder = app.get(VehicleSeeder);
  const userSeeder = app.get(UserSeeder);

  await vehicleSeeder.seed();
  await userSeeder.seed();

  await app.listen(appPort);
}
bootstrap();
