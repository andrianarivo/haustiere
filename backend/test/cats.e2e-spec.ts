import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../src/auth/password.service';
import { Role } from '@prisma/client';

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let passwordService: PasswordService;
  let adminToken: string;
  let testAdminUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    passwordService = app.get<PasswordService>(PasswordService);

    // Clean up users table
    await prisma.user.deleteMany();
    
    // Create test admin user
    const hashedPassword = await passwordService.hashPassword('test123');
    testAdminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: Role.ADMIN
      }
    });
    
    // Create admin token for protected routes with the correct payload structure
    adminToken = jwtService.sign({ 
      userId: testAdminUser.id,
      role: testAdminUser.role
    });

    await app.init();
  });

  beforeEach(async () => {
    // Clean the cats table before each test
    await prisma.cat.deleteMany();
  });

  afterAll(async () => {
    await prisma.cat.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/cats (POST)', () => {
    it('should create a new cat', () => {
      return request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Cat',
          age: 4,
          breed: 'Persian'
        })
        .expect(201)
        .expect(res => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Test Cat');
          expect(res.body.data.age).toBe(4);
          expect(res.body.data.breed).toBe('Persian');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should fail if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          age: 4
        })
        .expect(400);
    });
  });

  describe('/cats (GET)', () => {
    beforeEach(async () => {
      // Create test cats
      await prisma.cat.createMany({
        data: [
          { name: 'Cat 1', age: 2, breed: 'Persian' },
          { name: 'Cat 2', age: 3, breed: 'Siamese' }
        ]
      });
    });

    it('should return all cats', () => {
      return request(app.getHttpServer())
        .get('/cats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(2);
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('/cats/:id (GET)', () => {
    let testCat;

    beforeEach(async () => {
      testCat = await prisma.cat.create({
        data: {
          name: 'Test Cat',
          age: 4,
          breed: 'Persian'
        }
      });
    });

    it('should return a cat by id', () => {
      return request(app.getHttpServer())
        .get(`/cats/${testCat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.id).toBe(testCat.id);
          expect(res.body.data.name).toBe(testCat.name);
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return 404 for non-existent cat', () => {
      return request(app.getHttpServer())
        .get('/cats/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('/cats/:id (PATCH)', () => {
    let testCat;

    beforeEach(async () => {
      testCat = await prisma.cat.create({
        data: {
          name: 'Test Cat',
          age: 4,
          breed: 'Persian'
        }
      });
    });

    it('should update a cat', () => {
      return request(app.getHttpServer())
        .patch(`/cats/${testCat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Cat',
          age: 5
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.name).toBe('Updated Cat');
          expect(res.body.data.age).toBe(5);
          expect(res.body.data.breed).toBe(testCat.breed);
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('/cats/:id (DELETE)', () => {
    let testCat;

    beforeEach(async () => {
      testCat = await prisma.cat.create({
        data: {
          name: 'Test Cat',
          age: 4,
          breed: 'Persian'
        }
      });
    });

    it('should delete a cat', () => {
      return request(app.getHttpServer())
        .delete(`/cats/${testCat.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.id).toBe(testCat.id);
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return 404 for non-existent cat', () => {
      return request(app.getHttpServer())
        .delete('/cats/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 
