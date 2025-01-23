import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { predefinedRoles } from '@lotchen/api/core';

@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
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
    await this.roleModel.create({
      name: 'Administrator',
      permissions: [
        ...predefinedRoles.Administrator.map((permission) => {
          return {
            code: permission,
          };
        }),
      ],
    });
  }

  @Get()
  async roles(): Promise<any> {
    return this.roleModel
      .find({}, 'id name permissions')
      .populate('permissions')
      .select('code')
      .lean()
      .exec();
  }
}
