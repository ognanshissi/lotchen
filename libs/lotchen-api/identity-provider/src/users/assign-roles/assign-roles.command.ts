import { CommandHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { User } from '../user.schema';
import { Role } from '../../roles';

export class AssignRolesCommand {
  userId!: string;
  roles!: string[];
}

export class AssignRolesCommandRequest {
  @ApiProperty({
    type: [String],
    description: 'List of permissions keys',
  })
  roles!: string[];
}

@Injectable()
export class AssignRolesCommandHandler
  implements CommandHandler<AssignRolesCommand, any>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('ROLE_MODEL') private readonly roleModel: Model<Role>
  ) {}

  public async handlerAsync(command: AssignRolesCommand): Promise<any> {
    const user = await this.userModel.findOne({ _id: command.userId }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // make sure given permissions are already registered
    // This action will clean unwanted permissions
    const roles = await this.roleModel
      .find({
        id: {
          $in: [...command.roles],
        },
      })
      .exec();

    if (roles.length) {
      user.roles = [...roles]; // update the current list of permissions
      await user.save();
    }
  }
}
