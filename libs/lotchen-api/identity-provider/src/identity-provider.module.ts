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
import { TeamsController, teamsHandlers } from './teams';

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
    TeamsController,
  ],
  providers: [
    ...identityModelsProvider,
    ...territoriesHandlers,
    ...agenciesHandlers,
    ...authHandlers,
    ...usersHandlers,
    ...profileHandlers,
    ...teamsHandlers,
  ],
  exports: [],
})
export class IdentityProviderModule {}
