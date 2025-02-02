import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { CatsResolver } from './cats.resolver';

@Module({
  controllers: [CatsController],
  providers: [CatsService, CatsResolver],
})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
