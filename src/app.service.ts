import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.validation';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService<EnvConfig>) {}

  getHello(): string {
    const environment = this.configService.get('NODE_ENV');
    return `Hello World! Running in ${environment} mode`;
  }
}
