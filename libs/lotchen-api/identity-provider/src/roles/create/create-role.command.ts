import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Role } from '../role.schema';
import { Request } from 'express';
import { RoleErrors } from '../role.errors';

export class CreateRoleCommand {
  @ApiProperty({ description: 'Name of the role', type: String })
  name!: string;

  @ApiProperty({ description: 'Permissions of the role', type: [String] })
  permissions!: string[];
}

export class CreateRoleCommandResponse {
  @ApiProperty({ description: 'Id of the role', type: String })
  id!: string;

  @ApiProperty({ description: 'Name of the role', type: String })
  name!: string;

  @ApiProperty({ description: 'Permissions of the role', type: [String] })
  permissions!: string[];
}

@Injectable()
export class CreateRoleCommandHandler
  implements CommandHandler<CreateRoleCommand, CreateRoleCommandResponse>
{
  constructor(@Inject('ROLE_MODEL') private readonly roleModel: Model<Role>) {}

  public async handlerAsync(
    command: CreateRoleCommand,
    req?: Request
  ): Promise<CreateRoleCommandResponse> {
    const existingRole = await this.roleModel
      .findOne({ name: command.name })
      .lean()
      .exec();
    if (existingRole) {
      throw new BadRequestException(
        RoleErrors.ROLE_ALREADY_EXISTS(command.name)
      );
    }

    const createdRole = new this.roleModel({
      name: command.name,
      permissions: command.permissions,
      builtIn: false,
    });

    const errors = createdRole.validateSync();

    if (errors) {
      throw new Error(errors.toString());
    }
    const savedRole = await createdRole.save();

    return {
      id: savedRole._id.toString(),
      name: savedRole.name,
      permissions: savedRole.permissions,
    };
  }
}
