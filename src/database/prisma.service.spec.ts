// src/database/prisma.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let moduleRef: TestingModule;
  let service: PrismaService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = moduleRef.get(PrismaService);

    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect');

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('should disconnect on module destroy via NestJS lifecycle', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect');
    const poolSpy = jest
      .spyOn((service as any).pool, 'end')
      .mockResolvedValue(undefined);

    await moduleRef.close();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(poolSpy).toHaveBeenCalledTimes(1);
  });
});
