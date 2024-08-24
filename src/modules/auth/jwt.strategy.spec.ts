import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../entities';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get<UserService>(UserService);
  });

  describe('validate', () => {
    it('should return a user if validation is successful', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);

      const result = await jwtStrategy.validate({ username: 'testuser' });

      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      await expect(
        jwtStrategy.validate({ username: 'testuser' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
