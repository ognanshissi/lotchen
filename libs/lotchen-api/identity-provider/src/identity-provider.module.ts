import { Module } from '@nestjs/common';
import { UsersController, usersHandlers } from './users';
import { AuthController, authHandlers } from './auth';
import { ProfileController, profileHandlers } from './profile';
import {
  CreateRoleCommandHandler,
  FindAllRolesQueryHandler,
  FindRoleByIdQueryHandler,
  RolesController,
  UpdateRolePermissionsCommandHandler,
} from './roles';
import { identityModelsProvider } from './models.provider';
import { TerritoriesController } from './territories/territories.controller';
import { territoriesHandlers } from './territories';
import { AgenciesController, agenciesHandlers } from './agencies';
import { PermissionsController } from './permissions';
import { TeamsController, teamsHandlers } from './teams';
import { organizationsHandlers } from './organizations';
import { OrganizationsController } from './organizations/organizations.controller';

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
    OrganizationsController,
  ],
  providers: [
    ...organizationsHandlers,
    ...identityModelsProvider,
    ...territoriesHandlers,
    ...agenciesHandlers,
    ...authHandlers,
    ...usersHandlers,
    ...profileHandlers,
    ...teamsHandlers,
    CreateRoleCommandHandler,
    UpdateRolePermissionsCommandHandler,
    FindRoleByIdQueryHandler,
    FindAllRolesQueryHandler,
  ],
  exports: [],
})
export class IdentityProviderModule {}
