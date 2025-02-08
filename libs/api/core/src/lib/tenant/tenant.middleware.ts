import {
  BadRequestException,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenant_fqdn: string },
    res: Response,
    next: (error?: Error | any) => void
  ) {
    const tenantHeader = req.headers['x-tenant-fqdn'] as string;

    if (!tenantHeader) {
      throw new BadRequestException('X-TENANT-FQDN not provided');
    }

    // This must be loaded from database (Tenant Master - api)
    const tenants = [
      {
        isLocked: false,
        name: 'Finafrica Microfinance Senegal',
        fqdn: 'finafrica_microfinance',
        underMaintenance: false,
      },
      {
        isLocked: false,
        name: 'Finafrica Microfinance Guinee',
        fqdn: 'db',
        underMaintenance: false,
      },
    ];

    const tenant = tenants.find((tenant) => tenant.fqdn === tenantHeader);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.isLocked) {
      throw new UnauthorizedException('Tenant is not authorized!');
    }
    req.tenant_fqdn = tenant.fqdn;
    next();
  }
}
