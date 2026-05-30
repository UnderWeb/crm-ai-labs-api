// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'crm-ai-labs-api',
      timestamp: new Date().toISOString(),
    };
  }
}
