import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate: (config) => envSchema.parse(config),
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {} 