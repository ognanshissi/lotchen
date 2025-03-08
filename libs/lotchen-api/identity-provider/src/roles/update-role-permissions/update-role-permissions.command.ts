import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Role } from '../role.schema';
import { REQUEST } from '@nestjs/core';
import { RoleErrors } from '../role.errors';

export class UpdateRolePermissionsCommand {
  @ApiProperty({
    description: 'Role to update',
    type: String,
    required: true,
  })
  role!: string;

  @ApiProperty({
    description: 'Permissions to update',
    type: [String],
    required: true,
  })
  permissions!: string[];
}

export class UpdateRolePermissionsCommandResponse {
  @ApiProperty({ description: 'Id of the role', type: String })
  id!: string;

  @ApiProperty({ description: 'Name of the role', type: String })
  name!: string;

  @ApiProperty({ description: 'Permissions of the role', type: [String] })
  permissions!: string[];
}

@Injectable()
export class UpdateRolePermissionsCommandHandler
  implements
    CommandHandler<
      UpdateRolePermissionsCommand,
      UpdateRolePermissionsCommandResponse
    >
{
  constructor(
    @Inject('ROLE_MODEL')
    private readonly roleModel: Model<Role>,

    @Inject(REQUEST) private readonly request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(
    command: UpdateRolePermissionsCommand
  ): Promise<UpdateRolePermissionsCommandResponse> {
    const role = await this.roleModel
      .findOne({ name: command.role })
      .lean()
      .exec();
    if (!role) {
      throw new BadRequestException(RoleErrors.ROLE_NOT_FOUND);
    }

    if (role.builtIn) {
      throw new BadRequestException(RoleErrors.BUILT_IN_ROLE_CANNOT_BE_EDITED);
    }

    const updatedRole = await this.roleModel.findOneAndUpdate(
      { name: command.role },
      {
        permissions: command.permissions,
        updatedBy: this.request.user.sub,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedRole) {
      throw new NotFoundException(RoleErrors.ROLE_NOT_FOUND);
    }

    return {
      id: updatedRole._id.toString(),
      name: updatedRole.name,
      permissions: updatedRole.permissions,
    };
  }
}
