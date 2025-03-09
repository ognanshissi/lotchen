import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './role.schema';
import { Model } from 'mongoose';
import {
  Permissions,
  PermissionsAction,
  predefinedRoles,
} from '@lotchen/api/core';
import {
  CreateRoleCommand,
  CreateRoleCommandHandler,
  CreateRoleCommandResponse,
} from './create/create-role.command';
import {
  UpdateRolePermissionsCommandHandler,
  UpdateRolePermissionsCommandResponse,
} from './update-role-permissions/update-role-permissions.command';
import {
  FindRoleByIdQueryHandler,
  FindRoleByIdQueryResponse,
} from './find-id/find-role-by-id.query';
import {
  FindAllRolesQuery,
  FindAllRolesQueryHandler,
} from './find-all/find-all-roles.query';

@ApiHeader({
  name: 'x-tenant-fqdn',
  description: 'The Tenant Fqdn',
})
@Controller({
  version: '1',
  path: 'roles',
})
@ApiTags('Roles')
export class RolesController {
  constructor(
    @Inject('ROLE_MODEL') private readonly roleModel: Model<Role>,
    private readonly _createRoleCommandHandler: CreateRoleCommandHandler,
    private readonly _updateRolePermissionsCommandHandler: UpdateRolePermissionsCommandHandler,
    private readonly _findRoleByIdQueryHandler: FindRoleByIdQueryHandler,
    private readonly _findAllRolesQueryHandler: FindAllRolesQueryHandler
  ) {}

  @Post()
  @Permissions(PermissionsAction.roleCreate)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created',
    type: CreateRoleCommandResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Role already exists',
  })
  async createRole(
    @Body() command: CreateRoleCommand
  ): Promise<CreateRoleCommandResponse> {
    return this._createRoleCommandHandler.handlerAsync(command);
  }

  @Put(':role')
  @Permissions(PermissionsAction.roleUpdate)
  @ApiResponse({
    status: 200,
    description: 'Role permissions updated',
    type: UpdateRolePermissionsCommandResponse,
  })
  @ApiResponse({ status: 400, description: 'Role not found' })
  async updateRolePermissions(
    @Param('role') role: string,
    @Body() permissions: string[]
  ): Promise<UpdateRolePermissionsCommandResponse> {
    return this._updateRolePermissionsCommandHandler.handlerAsync({
      role,
      permissions,
    });
  }

  @Get(':id')
  @Permissions(PermissionsAction.roleRead)
  @ApiResponse({
    status: 200,
    description: 'Role found',
    type: FindRoleByIdQueryResponse,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findRoleById(
    @Param('id') id: string
  ): Promise<FindRoleByIdQueryResponse> {
    return await this._findRoleByIdQueryHandler.handlerAsync({ id });
  }

  @Post('generate-predefined-roles')
  async generatePredefinedRoles() {
    // Clean all builtIn roles
    for (const roleKey of Object.keys(predefinedRoles)) {
      const permissions = predefinedRoles[roleKey];
      const roleExist = await this.roleModel
        .findOne({ name: roleKey }, '_id')
        .lean();
      if (roleExist) {
        // update permissions
        await this.roleModel.findOneAndUpdate(
          { name: roleKey },
          { permissions: permissions }
        );
      } else {
        // Create new role with permissions
        await this.roleModel.create({
          name: roleKey,
          builtIn: true,
          permissions: [...permissions],
        });
      }
    }
    return predefinedRoles;
  }

  @Get()
  @Permissions(PermissionsAction.roleList)
  @ApiResponse({
    status: 200,
    description: 'Roles found',
    type: FindRoleByIdQueryResponse,
    isArray: true,
  })
  async allRoles(
    @Query() query: FindAllRolesQuery
  ): Promise<FindRoleByIdQueryResponse[]> {
    return await this._findAllRolesQueryHandler.handlerAsync(query);
  }
}
