import { QueryHandler } from '@lotchen/api/core';
import { Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../role.schema';

export class FindAllRolesQuery {
  @ApiProperty({
    description: 'Fields to return',
    required: false,
    type: String,
  })
  fields!: string;

  @ApiProperty({ description: 'Filter by name', required: false, type: String })
  name!: string;
}

export class FindAllRolesQueryResponse {
  @ApiProperty({ description: 'Id of the role', type: String })
  id!: string;

  @ApiProperty({ description: 'Name of the role', type: String })
  name!: string;

  @ApiProperty({ description: 'Permissions of the role', type: [String] })
  permissions!: string[];
}

@Injectable()
export class FindAllRolesQueryHandler
  implements QueryHandler<FindAllRolesQuery, FindAllRolesQueryResponse[]>
{
  constructor(
    @Inject('ROLE_MODEL') private readonly roleModel: Model<RoleDocument>
  ) {}

  public async handlerAsync(
    query: FindAllRolesQuery
  ): Promise<FindAllRolesQueryResponse[]> {
    // Dynamic projection
    let projection = 'builtIn name permissions id';
    if (query.fields) {
      projection = query.fields.split(',').join(' ');
    }

    // Dynamic filter
    let filter: { [key: string]: any } = {};
    if (query.name) {
      filter = { name: query.name };
    }

    const roles = await this.roleModel
      .find(filter, projection, { sort: { createdAt: -1 }, limit: 100 })
      .lean()
      .exec();

    return roles.map((role: any) => {
      return {
        id: role._id,
        name: role.name,
        permissions: role.permissions,
        builtIn: role.builtIn,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }
}
