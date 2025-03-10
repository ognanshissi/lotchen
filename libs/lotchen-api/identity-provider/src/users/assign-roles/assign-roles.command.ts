import { CommandHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { UserDocument } from '../user.schema';
import { RoleDocument } from '../../roles';

export class AssignRolesCommand {
  userId!: string;
  roles!: string[];
}

export class AssignRolesCommandRequest {
  @ApiProperty({
    type: [String],
    description: 'List of role Ids',
  })
  roles!: string[];
}

@Injectable()
export class AssignRolesCommandHandler
  implements CommandHandler<AssignRolesCommand, void>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('ROLE_MODEL') private readonly roleModel: Model<RoleDocument>
  ) {}

  public async handlerAsync(command: AssignRolesCommand): Promise<void> {
    const user = await this.userModel.findOne({ _id: command.userId }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // make sure given permissions are already registered
    // This action will clean unwanted permissions
    const roles = await this.roleModel
      .find({
        name: {
          $in: [...command.roles],
        },
      })
      .exec();

    if (roles.length) {
      user.roles = [...roles];
      // update the current list of permissions
      user.permissions = roles.map((role) => role.permissions).flat();
      await user.save();
    }
  }
}
