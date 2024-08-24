import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../enum/index.enum';

export class CreateUserDto {
  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  lastName: string;

  @IsString()
  firstName: string;
}
