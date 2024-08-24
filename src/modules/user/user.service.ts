import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/index.dto';
import { UserRole } from './enum/index.enum';
import { User } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.userRepo.create({
      username: createUserDto.username,
      password: hashedPassword,
      role: createUserDto.role || UserRole.CUSTOMER,
      lastName: createUserDto.lastName,
      firstName: createUserDto.firstName,
    });

    return this.userRepo.save(user);
  }

  async findByUsername(username: string) {
    return this.userRepo.findOneBy({ username });
  }
}
