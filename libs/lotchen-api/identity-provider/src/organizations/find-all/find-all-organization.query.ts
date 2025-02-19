import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { OrganizationsProvider } from '../organizations.provider';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllOrganizationQuery {}

export class FindAllOrganizationQueryResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

@Injectable()
export class FindAllOrganizationQueryHandler
  implements
    QueryHandler<FindAllOrganizationQuery, FindAllOrganizationQueryResponse[]>
{
  constructor(private readonly _organizationsProvider: OrganizationsProvider) {}

  public async handlerAsync(
    query?: FindAllOrganizationQuery | undefined
  ): Promise<FindAllOrganizationQueryResponse[]> {
    const list = await this._organizationsProvider.OrganizationModel.find(
      {},
      'id name description createdAt updatedAt'
    ).exec();

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
}
