import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/index.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Successfully logged in',
    schema: {
      example: {
        data: { access_token: 'jwt.token.here' },
        message: '',
        status: 'success',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        data: null,
        message: 'Invalid credentials',
        status: 'error',
      },
    },
  })
  async login(@Body() req: LoginDto): Promise<{
    access_token: string;
  }> {
    const user = await this.authService.validateUser(
      req.username,
      req.password,
    );
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
