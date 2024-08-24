import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/user/enum/index.enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
