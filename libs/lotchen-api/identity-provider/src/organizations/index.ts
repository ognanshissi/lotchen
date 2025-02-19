import { CreateOrganizationCommandHandler } from './create/create-organization.command';
import { OrganizationsProvider } from './organizations.provider';
import { Connection } from 'mongoose';
import { Organization, OrganizationSchema } from './organization.schema';
import {
  OrganizationUsers,
  OrganizationUsersSchema,
} from './organization-users.schema';
import { FindAllOrganizationQueryHandler } from './find-all/find-all-organization.query';

export * from './organization.schema';

export const organizationsHandlers = [
  CreateOrganizationCommandHandler,
  FindAllOrganizationQueryHandler,
  OrganizationsProvider,

  {
    provide: 'ORGANIZATION_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Organization.name, OrganizationSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: 'ORGANIZATION_USERS_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        OrganizationUsers.name,
        OrganizationUsersSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
];
