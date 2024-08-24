import { Logger, Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Valuation, Vehicle } from '../../entities';
import { HttpModule } from '@nestjs/axios';
import { VehicleSeeder } from './vehicle.seeder';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, Valuation]),
    HttpModule.register({ validateStatus: () => true }),
    ConfigModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService, Logger, VehicleSeeder],
  exports: [VehicleService, VehicleSeeder],
})
export class VehicleModule {}
