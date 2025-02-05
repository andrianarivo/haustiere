import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const authToken = client.handshake?.auth?.token || 
                       client.handshake?.headers?.authorization;

      if (!authToken) {
        throw new WsException('Unauthorized access');
      }

      // Remove 'Bearer ' if present
      const token = authToken.replace('Bearer ', '');

      // Verify the JWT token
      const payload = this.jwtService.verify(token);
      
      // Get the user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new WsException('User not found');
      }

      // Attach user to socket
      (client as any).user = user;

      return true;
    } catch (err) {
      throw new WsException('Unauthorized access');
    }
  }
} 