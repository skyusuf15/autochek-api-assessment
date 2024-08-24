import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { data: T; message: string; status: string }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; message: string; status: string }> {
    return next.handle().pipe(
      map((data) => {
        return {
          data: data?.data || data,
          message: data?.message || '',
          status: data?.status || 'success',
        };
      }),
    );
  }
}
