import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@WebSocketGateway({
  cors: true,
})
@UseGuards(WsJwtAuthGuard, WsRolesGuard)
export class CatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(CatsGateway.name);

  constructor(private readonly catsService: CatsService) {}

  async handleConnection(client: Socket) {
    try {
      return true;
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
      return false;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('read_all_cats')
  async findAll(
    @ConnectedSocket() client: Socket
  ) {
    try {
      const cats = await this.catsService.findAll();
      return { data: cats };
    } catch (error) {
      this.logger.error(`Error reading cats: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('add_cat')
  @Roles(Role.ADMIN)
  async create(
    @MessageBody() createCatDto: CreateCatDto,
  ) {
    try {
      const cat = await this.catsService.create(createCatDto);
      return { data: cat };
    } catch (error) {
      this.logger.error(`Error creating cat: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('update_cat')
  @Roles(Role.ADMIN)
  async update(
    @MessageBody() data: { id: number; updateCatDto: UpdateCatDto },
  ) {
    try {
      const cat = await this.catsService.update(data.id, data.updateCatDto);
      return { data: cat };
    } catch (error) {
      this.logger.error(`Error updating cat: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('remove_cat')
  @Roles(Role.ADMIN)
  async remove(
    @MessageBody() id: number,
  ) {
    try {
      const cat = await this.catsService.remove(id);
      return { data: cat };
    } catch (error) {
      this.logger.error(`Error removing cat: ${error.message}`);
      return { error: error.message };
    }
  }
} 