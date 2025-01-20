import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { QueryHandler } from '@lotchen/api/core';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model, ObjectId } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

export class FindUserByIdQuery {
  @ApiProperty()
  @IsNotEmpty()
  id!: string;
}

export class FindUserByIdQueryResponse {
  @ApiProperty()
  id!: ObjectId;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: Boolean })
  isVerified!: boolean;

  @ApiProperty({ type: Boolean })
  isLocked!: boolean;

  @ApiProperty({ type: Boolean })
  isSuperAdmin!: boolean;
}

@Injectable()
export class FindUserByIdQueryHandler
  implements QueryHandler<FindUserByIdQuery, FindUserByIdQueryResponse>
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  public async handlerAsync(
    query: FindUserByIdQuery
  ): Promise<FindUserByIdQueryResponse> {
    const user = await this.userModel
      .findById(query.id)
      .where({
        isDeleted: false,
        isSystemAdmin: false,
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User with id ' + query.id + ' not found !');
    }

    return {
      id: user.id,
      email: user.email,
      isLocked: user.isLocked,
      isVerified: user.isVerified,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
