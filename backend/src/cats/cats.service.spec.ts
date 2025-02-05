import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CatsService', () => {
  let service: CatsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: PrismaService,
          useValue: {
            cat: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
