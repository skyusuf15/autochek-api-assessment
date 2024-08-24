import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ResponseDto<T> {
  status: 'success' | 'error' | 'fail';

  @ApiPropertyOptional({ description: 'message about the request' })
  @IsString()
  @IsOptional()
  message?: string;

  data?: T;
}
