import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export class DeleteUserCommand {
  @ApiProperty()
  @IsNotEmpty()
  id!: string;
}

@Injectable()
export class DeleteUserCommandHandler
  implements CommandHandler<DeleteUserCommand, void>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(command: DeleteUserCommand): Promise<void> {
    const user = await this.userModel
      .countDocuments({ _id: command.id, deletedAt: null, isSuperAdmin: false })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { firstName, lastName, username, sub } = this._request.user;

    await this.userModel.findOneAndReplace(
      { _id: command.id, isSuperAdmin: false },
      {
        deletedAt: new Date(),
        updatedBy: sub,
        updatedByInfo: { firstName, lastName, username, userId: sub },
      }
    );
  }
}
