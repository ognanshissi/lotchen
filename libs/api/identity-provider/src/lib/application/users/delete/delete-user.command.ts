import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

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
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

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
