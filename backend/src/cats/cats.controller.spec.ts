import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { NotFoundException } from '@nestjs/common';

describe('CatsController', () => {
  let controller: CatsController;
  let service: CatsService;

  const mockCat = {
    id: 1,
    name: 'Test Cat',
    age: 4,
    breed: 'Persian'
  };

  const mockCatsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        {
          provide: CatsService,
          useValue: mockCatsService,
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cat', async () => {
      const createCatDto: CreateCatDto = {
        name: 'Test Cat',
        age: 4,
        breed: 'Persian'
      };

      mockCatsService.create.mockResolvedValue(mockCat);

      const result = await controller.create(createCatDto);
      expect(result).toEqual(mockCat);
      expect(mockCatsService.create).toHaveBeenCalledWith(createCatDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const cats = [mockCat];
      mockCatsService.findAll.mockResolvedValue(cats);

      const result = await controller.findAll();
      expect(result).toEqual(cats);
      expect(mockCatsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single cat', async () => {
      mockCatsService.findOne.mockResolvedValue(mockCat);

      const result = await controller.findOne(1);
      expect(result).toEqual(mockCat);
      expect(mockCatsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when cat is not found', async () => {
      mockCatsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a cat', async () => {
      const updateCatDto: UpdateCatDto = {
        name: 'Updated Cat',
        age: 5
      };

      const updatedCat = { ...mockCat, ...updateCatDto };
      mockCatsService.update.mockResolvedValue(updatedCat);

      const result = await controller.update(1, updateCatDto);
      expect(result).toEqual(updatedCat);
      expect(mockCatsService.update).toHaveBeenCalledWith(1, updateCatDto);
    });
  });

  describe('remove', () => {
    it('should remove a cat', async () => {
      mockCatsService.remove.mockResolvedValue(mockCat);

      const result = await controller.remove(1);
      expect(result).toEqual(mockCat);
      expect(mockCatsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
