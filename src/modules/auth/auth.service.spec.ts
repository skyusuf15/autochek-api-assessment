// src/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'john_doe',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(
        'john_doe',
        'correct_password',
      );

      expect(result).toEqual({ id: 1, username: 'john_doe' });
      expect(userService.findByUsername).toHaveBeenCalledWith('john_doe');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct_password',
        'hashedPassword',
      );
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      const result = await authService.validateUser(
        'john_doe',
        'wrong_password',
      );

      expect(result).toBeNull();
      expect(userService.findByUsername).toHaveBeenCalledWith('john_doe');
    });

    it('should return null if password does not match', async () => {
      const mockUser = {
        id: 1,
        username: 'john_doe',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await authService.validateUser(
        'john_doe',
        'wrong_password',
      );

      expect(result).toBeNull();
      expect(userService.findByUsername).toHaveBeenCalledWith('john_doe');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'hashedPassword',
      );
    });
  });

  describe('login', () => {
    it('should return an access_token', async () => {
      const mockUser = { userId: 1, username: 'john_doe' };
      const mockToken = 'jwt.token.here';
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(result).toEqual({ access_token: mockToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'john_doe',
        sub: 1,
      });
    });
  });
});
