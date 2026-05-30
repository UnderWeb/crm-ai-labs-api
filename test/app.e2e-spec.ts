import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Application Bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: (): Promise<void> => Promise.resolve(),
        $disconnect: (): Promise<void> => Promise.resolve(),
        onModuleInit: (): Promise<void> => Promise.resolve(),
        onModuleDestroy: (): Promise<void> => Promise.resolve(),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should bootstrap application successfully', () => {
    expect(app).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
