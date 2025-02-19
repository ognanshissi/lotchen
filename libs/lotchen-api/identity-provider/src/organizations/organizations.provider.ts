import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Organization } from './organization.schema';
import { OrganizationUsers } from './organization-users.schema';

@Injectable()
export class OrganizationsProvider {
  constructor(
    @Inject('ORGANIZATION_MODEL')
    public readonly OrganizationModel: Model<Organization>,
    @Inject('ORGANIZATION_USERS_MODEL')
    public readonly OrganizationUsersModel: Model<OrganizationUsers>
  ) {}
}
