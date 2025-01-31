import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { QueryHandler } from '@lotchen/api/core';
import { User } from '../user.schema';
import { Model, ObjectId } from 'mongoose';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

export class FindUserByIdQuery {
  @ApiProperty()
  @IsNotEmpty()
  id!: string;
}

export class FindUserByIdQueryRoleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
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

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({ type: () => FindUserByIdQueryRoleDto })
  roles!: FindUserByIdQueryRoleDto[];
}

@Injectable()
export class FindUserByIdQueryHandler
  implements QueryHandler<FindUserByIdQuery, FindUserByIdQueryResponse>
{
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>) {}

  public async handlerAsync(
    query: FindUserByIdQuery
  ): Promise<FindUserByIdQueryResponse> {
    const user = await this.userModel
      .findById(query.id)
      .where({
        isDeleted: false,
        isSystemAdmin: false,
      })
      .populate('roles')
      .populate('permissions')
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
      roles: user.roles.map((role) => {
        return {
          name: role.name,
          id: role._id,
        } as FindUserByIdQueryRoleDto;
      }),
      permissions: user.permissions.map((permission) => {
        return permission.code;
      }),
    };
  }
}
