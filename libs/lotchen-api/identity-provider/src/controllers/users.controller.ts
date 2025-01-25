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
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommandHandler } from '../application/users/create/create-user-command-handler';
import { CreateUserCommand } from '../application/users/create/create-user-command';
import { GetAllUserQueryHandler } from '../application/users/get-all/get-all-user-query-handler';
import { GetAllUserQuery } from '../application/users/get-all/get-all-user-query';
import {
  DeleteUserCommand,
  DeleteUserCommandHandler,
} from '../application/users/delete/delete-user.command';
import {
  FindUserByIdQueryHandler,
  FindUserByIdQueryResponse,
} from '../application/users/findby-id/find-user-by-id.query';
import {
  AssignPermissionsCommandHandler,
  AssignPermissionsCommandRequest,
} from '../application/users/assign-permissions/assign-permissions.command';
import { AuthGuard } from '../guards/auth.guard';
import {
  AssignRolesCommandHandler,
  AssignRolesCommandRequest,
} from '../application/users/assign-roles/assign-roles.command';
import {
  GetUserPermissionsQueryHandler,
  GetUserPermissionsQueryResponse,
} from '../application/users/get-permissions/get-user-permissions.query';

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
    private readonly _getAllUserQueryHandler: GetAllUserQueryHandler,
    private readonly _deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly _findUserByIdQueryHandler: FindUserByIdQueryHandler,
    private readonly _assignPermissionsCommandHandler: AssignPermissionsCommandHandler,
    private readonly _assignRolesCommandHandler: AssignRolesCommandHandler,
    private readonly _getUserPermissionsQueryHandler: GetUserPermissionsQueryHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: '2XX',
  })
  public async createUser(@Body() request: CreateUserCommand) {
    return await this._createUserHandler.handlerAsync(request);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({
    type: GetAllUserQuery,
  })
  public async findAll() {
    return await this._getAllUserQueryHandler.handlerAsync();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiResponse({
    type: FindUserByIdQueryResponse,
  })
  async findById(@Param('id') id: string) {
    return await this._findUserByIdQueryHandler.handlerAsync({ id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() command: DeleteUserCommand) {
    await this._deleteUserCommandHandler.handlerAsync(command);
  }

  @UseGuards(AuthGuard)
  @Put(':id/assign-permissions')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async assignPermissions(
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
  async assignRoles(
    @Body() request: AssignRolesCommandRequest,
    @Param('id') userId: string
  ): Promise<void> {
    return await this._assignRolesCommandHandler.handlerAsync({
      roles: request.roles,
      userId,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id/roles')
  async userRoles(@Param('id') userId: string): Promise<any> {
    console.log();
  }

  @UseGuards(AuthGuard)
  @Get(':id/permissions')
  @ApiResponse({
    type: GetUserPermissionsQueryResponse,
  })
  async userPermissions(
    @Param('id') userId: string
  ): Promise<GetUserPermissionsQueryResponse[]> {
    return await this._getUserPermissionsQueryHandler.handlerAsync({ userId });
  }
}
