import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from 'pg';
import config from '../config';

const API_KEY = '12345634';
const API_KEY_PROD = 'PROD1212121SA';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, name, pass, port } = configService.postgres;
        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password: pass,
          database: name,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.NODE_ENV === 'prod' ? API_KEY_PROD : API_KEY,
    },
    {
      provide: 'PG',
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, name, pass, port } = configService.postgres;
        const client = new Client({
          user,
          host,
          database: name,
          password: pass,
          port,
        });

        client.connect();
        return client;
      },
      inject: [config.KEY],
    },
  ],
  exports: ['API_KEY', 'PG', TypeOrmModule],
})
export class DatabaseModule {}
