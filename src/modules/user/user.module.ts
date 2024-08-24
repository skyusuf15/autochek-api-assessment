import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeeder } from './user.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UserService, UserSeeder],
  exports: [UserService, UserSeeder],
})
export class UserModule {}
