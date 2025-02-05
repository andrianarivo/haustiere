import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { UserDto } from './dto/user.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  // This function checks if a user's email/password are correct
  async validateUser(email: string, password: string): Promise<UserDto | null> {
    // Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    // Check if password matches
    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Return user DTO without password
    return new UserDto({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  // This function creates a new user account
  async register(email: string, password: string): Promise<UserDto> {
    const hashedPassword = await this.passwordService.hashPassword(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Role.USER, // Always create new users with USER role
        },
      });

      return new UserDto({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  // This function creates a JWT token when user logs in
  async login(user: UserDto) {
    return {
      access_token: this.jwtService.sign({ 
        userId: user.id,
        role: user.role 
      }),
      user,
    };
  }
}
