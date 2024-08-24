import { Injectable } from '@nestjs/common';
import { UserRole } from './enum/index.enum';
import { UserService } from './user.service';

@Injectable()
export class UserSeeder {
  constructor(private userService: UserService) {}

  async seed() {
    const admin = await this.userService.findByUsername('admin');
    if (!admin) {
      await this.userService.createUser({
        username: 'admin',
        password: 'password',
        role: UserRole.ADMIN,
        lastName: 'admin',
        firstName: 'user',
      });
    }

    const dealer = await this.userService.findByUsername('dealer');
    if (!dealer) {
      await this.userService.createUser({
        username: 'dealer',
        password: 'password',
        role: UserRole.DEALER,
        lastName: 'dealer',
        firstName: 'user',
      });
    }

    const customer = await this.userService.findByUsername('customer');
    if (!customer) {
      await this.userService.createUser({
        username: 'customer',
        password: 'password',
        role: UserRole.CUSTOMER,
        lastName: 'customer',
        firstName: 'user',
      });
    }
  }
}
