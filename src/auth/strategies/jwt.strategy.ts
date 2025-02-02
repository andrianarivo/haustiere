import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDto } from '../dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService, private configService: ConfigService<EnvConfig>) {
    // Make sure JWT_SECRET exists
    const jwtSecret = configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      // Get JWT from the Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Our secret key to sign tokens
      secretOrKey: jwtSecret,
    });
  }

  // This runs when we validate the JWT token
  async validate(payload: { userId: number; role: string }): Promise<UserDto> {
    try {
      // Find the user by their ID from the token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Transform the user data into our DTO
      return new UserDto({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 
