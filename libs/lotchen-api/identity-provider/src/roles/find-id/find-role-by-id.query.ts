import { QueryHandler } from '@lotchen/api/core';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Role } from '../role.schema';
import { RoleErrors } from '../role.errors';

export class FindRoleByIdQuery {
  @ApiProperty({ description: 'Role Id', type: String })
  id!: string;
}

export class FindRoleByIdQueryResponse {
  @ApiProperty({ description: 'Id of the role', type: String })
  id!: string;

  @ApiProperty({ description: 'Name of the role', type: String })
  name!: string;

  @ApiProperty({ description: 'Permissions of the role', type: [String] })
  permissions!: string[];
}

@Injectable()
export class FindRoleByIdQueryHandler
  implements QueryHandler<FindRoleByIdQuery, FindRoleByIdQueryResponse>
{
  constructor(@Inject('ROLE_MODEL') private readonly roleModel: Model<Role>) {}

  public async handlerAsync(
    query: FindRoleByIdQuery
  ): Promise<FindRoleByIdQueryResponse> {
    const role = await this.roleModel
      .findById(query.id, 'name permissions id')
      .lean()
      .exec();

    if (!role) {
      throw new NotFoundException(RoleErrors.ROLE_NOT_FOUND);
    }

    return {
      id: role._id,
      name: role.name,
      permissions: role.permissions,
    };
  }
}
