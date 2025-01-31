import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  @ApiProperty()
  @IsNotEmpty()
  id!: string;
}

@Injectable()
export class DeleteUserCommandHandler
  implements CommandHandler<DeleteUserCommand, void>
{
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>) {}

  public async handlerAsync(command: DeleteUserCommand): Promise<void> {
    const user = await this.userModel
      .findById(command.id)
      .where({ isDeleted: false })
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException();
    }

    await this.userModel.findByIdAndUpdate(user._id, { isDeleted: true });
  }
}
