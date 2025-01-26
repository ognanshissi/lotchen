import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { CreateUserCommandHandler } from './application/users/create/create-user-command-handler';
import { GetAllUserQueryHandler } from './application/users/get-all/get-all-user-query-handler';
import { LoginCommandHandler } from './application/auth/login/login-command';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenCommandHandler } from './application/auth/refresh-token/refresh-token.command';
import { ForgotPasswordCommandHandler } from './application/auth/forgot-password/forgot-password.command';
import { ResetPasswordCommandHandler } from './application/auth/reset-password/reset-password.command';
import { ProfileController } from './controllers/profile.controller';
import { DeleteUserCommandHandler } from './application/users/delete/delete-user.command';
import { FindUserByIdQueryHandler } from './application/users/findby-id/find-user-by-id.query';
import { PermissionsController } from './controllers/permissions.controller';
import { GetUserProfileQueryHandler } from './application/profile/get-profile/get-user-profile.query';
import { RolesController } from './controllers/roles.controller';
import { identityModelsProvider } from './models.provider';
import { AssignPermissionsCommandHandler } from './application/users/assign-permissions/assign-permissions.command';
import { AssignRolesCommandHandler } from './application/users/assign-roles/assign-roles.command';
import { GetUserPermissionsQueryHandler } from './application/users/get-permissions/get-user-permissions.query';
import { TerritoriesController } from './controllers/territories.controller';
import { territoriesHandlers } from './application/territories';
import { agenciesHandlers } from './application/agencies';
import { AgenciesController } from './controllers/agencies.controller';

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
    CreateUserCommandHandler,
    GetAllUserQueryHandler,
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    ForgotPasswordCommandHandler,
    ResetPasswordCommandHandler,
    DeleteUserCommandHandler,
    FindUserByIdQueryHandler,
    GetUserProfileQueryHandler,
    AssignPermissionsCommandHandler,
    AssignRolesCommandHandler,
    GetUserPermissionsQueryHandler,
  ],
  exports: [],
})
export class IdentityProviderModule {}
