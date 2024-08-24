import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { loggerOptions } from './config/logger.config';
import { getTypeOrmConfig } from './config';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { LoanModule } from './modules/loan/loan.module';
import { UserModule } from './modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    WinstonModule.forRoot(loggerOptions),
    VehicleModule,
    LoanModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
