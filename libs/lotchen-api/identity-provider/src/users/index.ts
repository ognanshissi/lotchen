import { PaginateAllUsersCommandHandler } from './paginate-all/paginate-all-users.command';
import { AssignRolesCommandHandler } from './assign-roles/assign-roles.command';
import { AssignPermissionsCommandHandler } from './assign-permissions/assign-permissions.command';
import { CreateUserCommandHandler } from './create/create-user-command-handler';
import { DeleteUserCommandHandler } from './delete/delete-user.command';
import { FindUserByIdQueryHandler } from './findby-id/find-user-by-id.query';
import { GetUserPermissionsQueryHandler } from './get-permissions/get-user-permissions.query';
import { FindAllUserQueryHandler } from './find-all/find-all-user-query-handler';
import { InviteUserCommandHandler } from './invite-user/invite-user.command';

export * from './user.schema';
export * from './user-token.schema';
export * from './users.controller';
export * from './create/create-user-command-handler';
export * from './create/create-user-command';
export * from './delete/delete-user.command';
export * from './assign-permissions/assign-permissions.command';
export * from './assign-roles/assign-roles.command';
export * from './findby-id/find-user-by-id.query';
export * from './find-all/find-all-user-query-handler';
export * from './find-all/find-all-user-query';
export * from './get-permissions/get-user-permissions.query';

export const usersHandlers = [
  AssignRolesCommandHandler,
  AssignPermissionsCommandHandler,
  CreateUserCommandHandler,
  DeleteUserCommandHandler,
  FindUserByIdQueryHandler,
  GetUserPermissionsQueryHandler,
  FindAllUserQueryHandler,
  PaginateAllUsersCommandHandler,
  InviteUserCommandHandler,
];
