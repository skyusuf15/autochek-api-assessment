import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';
import { CreateUserDto } from './dto/index.dto';
import { UserRole } from './enum/index.enum';

describe('UserService', () => {
  let userService: UserService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        role: UserRole.CUSTOMER,
        lastName: 'Doe',
        firstName: 'John',
      };

      const savedUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role: UserRole.CUSTOMER,
        lastName: 'Doe',
        firstName: 'John',
      };

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepo, 'create').mockReturnValue(savedUser as any);
      jest.spyOn(userRepo, 'save').mockResolvedValue(savedUser as any);

      const result = await userService.createUser(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
      expect(userRepo.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: 'hashedPassword',
        role: createUserDto.role,
        lastName: createUserDto.lastName,
        firstName: createUserDto.firstName,
      });
      expect(userRepo.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const username = 'testuser';
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        role: UserRole.CUSTOMER,
        lastName: 'Doe',
        firstName: 'John',
      };

      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as any);

      const result = await userService.findByUsername(username);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ username });
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);

      const result = await userService.findByUsername('nonexistentuser');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        username: 'nonexistentuser',
      });
      expect(result).toBeNull();
    });
  });
});
