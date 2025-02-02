import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  create(createCatDto: CreateCatDto) {
    return this.prisma.cat.create({
      data: createCatDto,
    });
  }

  findAll() {
    return this.prisma.cat.findMany();
  }

  async findOne(id: number) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return cat;
  }

  async update(id: number, updateCatDto: UpdateCatDto) {
    try {
      return await this.prisma.cat.update({
        where: { id },
        data: updateCatDto,
      });
    } catch (error) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.cat.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
  }
}
