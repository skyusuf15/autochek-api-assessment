import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

require('dotenv').config();

export const { APP_NAME, NODE_ENV } = process.env;
export const PORT = parseInt(process.env.PORT) || 3000;
export const isProd: boolean = NODE_ENV === 'production';
export const isDev: boolean = NODE_ENV === 'development';
export const appPort: number = PORT;

export const getTypeOrmConfig = (): DataSourceOptions => {
  return {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    entities: [join(__dirname, '../', 'entities/**/*.entity.{ts,js}')],
    namingStrategy: new SnakeNamingStrategy(),
  };
};
