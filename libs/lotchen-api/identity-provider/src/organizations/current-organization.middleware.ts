import {
  BadRequestException,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { OrganizationsProvider } from './organizations.provider';

export class CurrentOrganizationMiddleware implements NestMiddleware {
  constructor(private readonly _organizationProvider: OrganizationsProvider) {}

  async use(
    req: Request & { organizationId: string },
    res: Response,
    next: NextFunction
  ) {
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new BadRequestException('Organization Id is not provided');
    }

    const organization =
      await this._organizationProvider.OrganizationModel.findOne(
        { _id: organizationId },
        '_id name isActive'
      )
        .lean()
        .exec();

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    req.organizationId = organization._id;
    next();
  }
}
