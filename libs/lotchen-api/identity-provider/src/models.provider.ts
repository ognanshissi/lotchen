import { Connection } from 'mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { UserToken, UserTokenSchema } from './schemas/user-token.schema';
import { Provider } from '@nestjs/common';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Profile, ProfileSchema } from './schemas/profile.schema';

export const identityModelsProvider: Provider[] = [
  {
    provide: 'USER_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(User.name, UserSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: 'ROLE_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Role.name, RoleSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: 'USER_TOKEN_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(UserToken.name, UserTokenSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: 'PERMISSION_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Permission.name, PermissionSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: 'PROFILE_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Profile.name, ProfileSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
];
