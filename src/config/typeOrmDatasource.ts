import { DataSource } from 'typeorm';
import { getTypeOrmConfig } from '.';

export const typeOrmDatasource = new DataSource(getTypeOrmConfig());
