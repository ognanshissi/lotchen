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
  @ApiProperty({ description: 'Role Id', type: String })
  id!: string;

  @ApiProperty({ description: 'Role Name', type: String })
  name!: string;
}

export class FindUserByIdQueryResponse {
  @ApiProperty({ description: 'User Id', type: String })
  id!: string;

  @ApiProperty({ description: 'User Email', type: String })
  email!: string;

  @ApiProperty({ type: Boolean, description: 'Is user verified' })
  isVerified!: boolean;

  @ApiProperty({ type: Boolean, description: 'Is user locked' })
  isLocked!: boolean;

  @ApiProperty({ type: Boolean, description: 'Is user super admin' })
  isSuperAdmin!: boolean;

  @ApiProperty({ type: [String], description: 'User permissions' })
  permissions!: string[];

  @ApiProperty({
    type: () => FindUserByIdQueryRoleDto,
    description: 'User roles',
  })
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
        deleteAt: null,
        isSystemAdmin: false,
      })
      .populate('roles')
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
      permissions: user.roles.map((role) => role.permissions).flat(),
    };
  }
}
