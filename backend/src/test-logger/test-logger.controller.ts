import { Controller, Get, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Controller('test-logger')
export class TestLoggerController {
  private readonly logger = new Logger(TestLoggerController.name);

  @Get('all-logs')
  testAllLogs() {
    this.logger.log('This is a normal log message');
    this.logger.error('This is an error message');
    this.logger.warn('This is a warning message');
    this.logger.debug('This is a debug message');
    this.logger.verbose('This is a verbose message');
    
    return { message: 'All log levels have been tested' };
  }

  @Get('error')
  testError() {
    this.logger.error('This is a caught exception', new Error('Test error').stack);
    throw new HttpException('This is a test error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Get('uncaught')
  testUncaughtError() {
    this.logger.warn('About to throw an uncaught error');
    throw new Error('This is an uncaught error that should be handled by our exception filter');
  }
} 