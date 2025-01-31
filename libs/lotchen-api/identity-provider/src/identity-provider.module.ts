import { Module } from '@nestjs/common';
import { UsersController, usersHandlers } from './users';
import { AuthController, authHandlers } from './auth';
import { ProfileController, profileHandlers } from './profile';
import { RolesController } from './roles';
import { identityModelsProvider } from './models.provider';
import { TerritoriesController } from './territories/territories.controller';
import { territoriesHandlers } from './territories';
import { AgenciesController, agenciesHandlers } from './agencies';
import { PermissionsController } from './permissions';

@Module({
  imports: [],
  controllers: [
    UsersController,
    AuthController,
    ProfileController,
    PermissionsController,
    RolesController,
    TerritoriesController,
    AgenciesController,
  ],
  providers: [
    ...identityModelsProvider,
    ...territoriesHandlers,
    ...agenciesHandlers,
    ...authHandlers,
    ...usersHandlers,
    ...profileHandlers,
  ],
  exports: [],
})
export class IdentityProviderModule {}
