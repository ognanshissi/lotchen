import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from './role.schema';
import { Model } from 'mongoose';
import {
  Permissions,
  PermissionsAction,
  predefinedRoles,
} from '@lotchen/api/core';
import {
  CreateRoleCommandHandler,
  CreateRoleCommandResponse,
} from './create/create-role.command';
import {
  UpdateRolePermissionsCommandHandler,
  UpdateRolePermissionsCommandResponse,
} from './update-role-permissions/update-role-permissions.command';

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
    private readonly _updateRolePermissionsCommandHandler: UpdateRolePermissionsCommandHandler
  ) {}

  @Post()
  @Permissions(PermissionsAction.roleCreate)
  @ApiResponse({
    status: 201,
    description: 'Role created',
    type: CreateRoleCommandResponse,
  })
  @ApiResponse({ status: 400, description: 'Role already exists' })
  async createRole(
    @Body() command: CreateRoleCommandResponse
  ): Promise<CreateRoleCommandResponse> {
    return this._createRoleCommandHandler.handlerAsync(command);
  }

  @Post(':role/permissions')
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

  @Permissions(PermissionsAction.roleList)
  @Get()
  async allRoles(): Promise<any> {
    return this.roleModel.find({}, 'id name permissions builtIn').lean().exec();
  }
}
