import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from './role.schema';
import { Model } from 'mongoose';
import {
  Permissions,
  PermissionsAction,
  predefinedRoles,
} from '@lotchen/api/core';

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
  constructor(@Inject('ROLE_MODEL') private readonly roleModel: Model<Role>) {}

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
