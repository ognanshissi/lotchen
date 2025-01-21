import {
  BadRequestException,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenant_fqn: string },
    res: Response,
    next: (error?: Error | any) => void
  ) {
    const tenantHeader = req.headers['x-tenant-fqn'] as string;

    if (!tenantHeader) {
      throw new BadRequestException('X-TENANT-FQN not provided');
    }

    const tenants = [
      {
        isLocked: false,
        name: 'Finafrica Microfinance Senegal',
        fqn: 'finafrica_microfinance',
        underMaintenance: false,
      },
      {
        isLocked: false,
        name: 'Finafrica Microfinance Guinee',
        fqn: 'db',
        underMaintenance: false,
      },
    ];

    const tenant = tenants.find((tenant) => tenant.fqn === tenantHeader);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.isLocked) {
      throw new UnauthorizedException('Tenant is not authorized!');
    }
    req.tenant_fqn = tenant.fqn;
    next();
  }
}
