import { CommandHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { User } from '../../../schemas/user.schema';
import { Permission } from '../../../schemas/permission.schema';

export class AssignPermissionsCommand {
  userId!: string;
  permissions!: string[];
}

export class AssignPermissionsCommandRequest {
  @ApiProperty({
    type: [String],
    description: 'List of permissions keys',
  })
  permissions!: string[];
}

export class AssignPermissionsCommandResponse {}

@Injectable()
export class AssignPermissionsCommandHandler
  implements CommandHandler<AssignPermissionsCommand, any>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('PERMISSION_MODEL')
    private readonly permissionModel: Model<Permission>
  ) {}

  public async handlerAsync(command: AssignPermissionsCommand): Promise<any> {
    const user = await this.userModel.findOne({ _id: command.userId }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // make sure given permissions are already registered
    // This action will clean unwanted permissions
    const permissions = await this.permissionModel
      .find({
        code: {
          $in: [...command.permissions],
        },
      })
      .exec();

    if (permissions.length) {
      user.permissions = [...permissions]; // update the current list of permissions
      await user.save();
    }
  }
}
