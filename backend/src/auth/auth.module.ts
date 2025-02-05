import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PasswordService } from './password.service';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.validation';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';

@Global()
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordService,
    WsJwtAuthGuard,
    WsRolesGuard
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
