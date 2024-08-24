import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest
              .fn()
              .mockReturnValue({ access_token: 'jwt.token.here' }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access_token if credentials are valid', async () => {
      const validUser = { username: 'john_doe', userId: 1 };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(validUser);

      const result = await authController.login({
        username: 'john_doe',
        password: 'strong_password',
      });

      expect(result).toEqual({ access_token: 'jwt.token.here' });
      expect(authService.validateUser).toHaveBeenCalledWith(
        'john_doe',
        'strong_password',
      );
    });

    it('should throw BadRequestException if credentials are invalid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        authController.login({
          username: 'john_doe',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(authService.validateUser).toHaveBeenCalledWith(
        'john_doe',
        'wrong_password',
      );
    });
  });
});
