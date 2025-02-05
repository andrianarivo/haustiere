import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CatsResolver } from './cats.resolver';
import { CatsGateway } from './cats.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CatsController],
  providers: [CatsService, CatsResolver, CatsGateway],
})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
