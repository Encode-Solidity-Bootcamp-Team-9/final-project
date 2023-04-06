import { Module } from '@nestjs/common';
import { PG_CONNECTION } from '../config';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

const dbProvider = {
  provide: PG_CONNECTION,
  useFactory: (configService: ConfigService) => {
    return new Pool({
      user: configService.get('PG_USER'),
      host: configService.get('PG_HOST'),
      database: configService.get('PG_DATABASE'),
      password: configService.get('PG_PASSWORD'),
      port: configService.get('PG_PORT'),
    });
  },
  inject: [ConfigService],
};

@Module({
  providers: [dbProvider, ConfigService],
  exports: [dbProvider],
})
export class DbModule {}
