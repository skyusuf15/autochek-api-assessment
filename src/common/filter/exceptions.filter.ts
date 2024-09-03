import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    if (!isHttpException) {
      // Log unexpected errors for further investigation
      this.logger.error(
        `Unexpected error occurred: ${JSON.stringify(exception)}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const errorResponse = {
      status: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'fail',
      message: typeof message === 'object' ? (message as any).message : message,
      developerMessage: exception instanceof Error ? exception.message : '',
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}
