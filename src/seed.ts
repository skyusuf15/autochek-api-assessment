import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VehicleSeeder } from './modules/vehicle/vehicle.seeder';
import { UserSeeder } from './modules/user/user.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const vehicleSeeder = app.get(VehicleSeeder);
  const userSeeder = app.get(UserSeeder);

  await vehicleSeeder.seed();
  await userSeeder.seed();

  await app.close();
}

bootstrap();
