import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check database connection
      () => this.prismaHealth.isHealthy('database'),
      
      // Check disk storage
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9,
          path: '/',
        }),
      
      // Check heap memory usage
      () =>
        this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
    ]);
  }
} 
