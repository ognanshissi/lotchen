import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../schemas/role.schema';
import { Model } from 'mongoose';
import { predefinedRoles } from '../utils/roles.predefined';

@Controller({
  version: '1',
  path: 'roles',
})
@ApiTags('Roles')
export class RolesController {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>
  ) {}

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
}
