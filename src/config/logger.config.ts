import { utilities } from 'nest-winston';
import { format, LoggerOptions, transport, transports } from 'winston';
import { APP_NAME, NODE_ENV } from '.';

const isTest = process.env.NODE_ENV === 'test';

const getLogTransport = (): transport => {
  return new transports.Console({
    format: format.combine(
      format.colorize(),
      format.ms(),
      utilities.format.nestLike(APP_NAME, {
        prettyPrint: true,
      }),
    ),
  });
};

const loggerOptions: LoggerOptions = {
  defaultMeta: {
    type: APP_NAME,
    env: NODE_ENV,
    mode: 'server',
  },
  transports: [getLogTransport()],
  level: 'debug',
};

if (!isTest) {
  loggerOptions.format = format.combine(
    format.label({ label: APP_NAME }),
    format.timestamp(),
    format.errors({ stack: true }),
    format.metadata({
      key: 'metadata',
      fillExcept: [
        'message',
        'level',
        'timestamp',
        'label',
        'type',
        'env',
        'mode',
      ],
    }),
    format.splat(),
    format.simple(),
  );
}

export { loggerOptions };
