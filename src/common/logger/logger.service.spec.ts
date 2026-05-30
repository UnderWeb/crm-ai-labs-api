// src/common/logger/logger.service.spec.ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { LoggerService } from './logger.service';

interface LogPayload {
  level: string;
  message: string;
  context?: string;
  meta?: {
    trace?: string;
  };
}

describe('LoggerService', () => {
  let service: LoggerService;
  let stdoutWriteSpy: jest.Spied<typeof process.stdout.write>;
  let stderrWriteSpy: jest.Spied<typeof process.stderr.write>;

  beforeEach(() => {
    service = new LoggerService();

    stdoutWriteSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    stderrWriteSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log message in structured format', () => {
    service.log('test message', 'TestContext');

    expect(stdoutWriteSpy).toHaveBeenCalled();

    const firstCallArg = stdoutWriteSpy.mock.calls[0]?.[0];
    const output =
      typeof firstCallArg === 'string' ? firstCallArg : String(firstCallArg);

    const parsed = JSON.parse(output) as LogPayload;

    expect(parsed.level).toBe('log');
    expect(parsed.message).toBe('test message');
    expect(parsed.context).toBe('TestContext');
  });

  it('should log error to stderr with trace', () => {
    service.error('error message', 'stacktrace', 'ErrorContext');

    expect(stderrWriteSpy).toHaveBeenCalled();

    const firstCallArg = stderrWriteSpy.mock.calls[0]?.[0];
    const output =
      typeof firstCallArg === 'string' ? firstCallArg : String(firstCallArg);

    const parsed = JSON.parse(output) as LogPayload;

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('error message');
    expect(parsed.meta?.trace).toBe('stacktrace');
  });

  it('should not log debug in production mode', () => {
    const originalEnv = process.env.APP_ENV;
    process.env.APP_ENV = 'production';

    service.debug('debug message', 'DebugContext');

    expect(stdoutWriteSpy).not.toHaveBeenCalled();

    process.env.APP_ENV = originalEnv;
  });
});
