import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommandHandler } from './create/create-user-command-handler';
import { CreateUserCommand } from './create/create-user-command';
import { FindAllUserQueryHandler } from './find-all/find-all-user-query-handler';
import {
  FindAllUserQuery,
  FindAllUserQueryResponse,
} from './find-all/find-all-user-query';
import {
  DeleteUserCommand,
  DeleteUserCommandHandler,
} from './delete/delete-user.command';
import {
  FindUserByIdQueryHandler,
  FindUserByIdQueryResponse,
} from './findby-id/find-user-by-id.query';
import {
  AssignPermissionsCommandHandler,
  AssignPermissionsCommandRequest,
} from './assign-permissions/assign-permissions.command';
import {
  AssignRolesCommandHandler,
  AssignRolesCommandRequest,
} from './assign-roles/assign-roles.command';
import { GetUserPermissionsQueryHandler } from './get-permissions/get-user-permissions.query';
import { ApiPaginationResponse, AuthGuard } from '@lotchen/api/core';
import {
  PaginateAllUsersCommand,
  PaginateAllUsersCommandDto,
  PaginateAllUsersCommandHandler,
  PaginateAllUsersCommandResponse,
} from './paginate-all/paginate-all-users.command';
import {
  InviteUserCommand,
  InviteUserCommandHandler,
} from './invite-user/invite-user.command';

@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(
    private readonly _createUserHandler: CreateUserCommandHandler,
    private readonly _findAllUserQueryHandler: FindAllUserQueryHandler,
    private readonly _deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly _findUserByIdQueryHandler: FindUserByIdQueryHandler,
    private readonly _assignPermissionsCommandHandler: AssignPermissionsCommandHandler,
    private readonly _assignRolesCommandHandler: AssignRolesCommandHandler,
    private readonly _getUserPermissionsQueryHandler: GetUserPermissionsQueryHandler,
    private readonly _paginateAllUserCommandHandler: PaginateAllUsersCommandHandler,
    private readonly _inviteUserCommandHandler: InviteUserCommandHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: '2XX',
  })
  public async createUser(@Body() request: CreateUserCommand) {
    return await this._createUserHandler.handlerAsync(request);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({
    type: [FindAllUserQueryResponse],
  })
  public async allUsers(
    @Query() filterQuery: FindAllUserQuery
  ): Promise<FindAllUserQueryResponse[]> {
    return await this._findAllUserQueryHandler.handlerAsync(filterQuery);
  }

  // @UseGuards(AuthGuard)
  @Get(':id')
  @ApiResponse({
    type: FindUserByIdQueryResponse,
  })
  async findUserById(@Param('id') id: string) {
    return await this._findUserByIdQueryHandler.handlerAsync({ id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() command: DeleteUserCommand) {
    await this._deleteUserCommandHandler.handlerAsync(command);
  }

  @UseGuards(AuthGuard)
  @Put(':id/assign-permissions')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async assignPermissionsToUser(
    @Body() body: AssignPermissionsCommandRequest,
    @Param('id') userId: string
  ): Promise<void> {
    await this._assignPermissionsCommandHandler.handlerAsync({
      userId,
      permissions: body.permissions,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id/assign-roles')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async assignRolesToUser(
    @Body() request: AssignRolesCommandRequest,
    @Param('id') userId: string
  ): Promise<void> {
    return await this._assignRolesCommandHandler.handlerAsync({
      roles: request.roles,
      userId,
    });
  }

  @UseGuards(AuthGuard)
  @Post(':id/roles')
  async updateUserRoles(
    @Param('id') userId: string,
    @Body('roles') roles: string[]
  ): Promise<any> {
    console.log();
  }

  @UseGuards(AuthGuard)
  @Get(':id/permissions')
  @ApiResponse({
    type: [String],
  })
  async petUserPermissions(@Param('id') userId: string): Promise<string[]> {
    return await this._getUserPermissionsQueryHandler.handlerAsync({ userId });
  }

  @ApiPaginationResponse(PaginateAllUsersCommandDto)
  @Post('/search')
  async searchUserPaginate(
    @Body() payload: PaginateAllUsersCommand
  ): Promise<PaginateAllUsersCommandResponse> {
    return await this._paginateAllUserCommandHandler.handlerAsync(payload);
  }

  @Post('/invite-user')
  @ApiResponse({
    status: '2XX',
  })
  @HttpCode(HttpStatus.CREATED)
  public async inviteUser(@Body() request: InviteUserCommand) {
    return await this._inviteUserCommandHandler.handlerAsync(request);
  }
}
