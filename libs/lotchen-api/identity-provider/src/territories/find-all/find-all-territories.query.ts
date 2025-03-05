import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../territories.provider';

export class FindAllTerritoriesQuery {
  @ApiProperty({
    description: 'Name of the territory',
    type: String,
    required: false,
  })
  name!: string;
}

export class TerritoryLightDto {
  @ApiProperty({ description: 'Id of the territory', type: String })
  id!: string;
  @ApiProperty({ description: 'Name of the territory', type: String })
  name!: string;
}

export class TerritoriesQueryUserDto {
  @ApiProperty({ description: 'User Id', type: String })
  id!: string;
  @ApiProperty({ description: 'Email', type: 'string' })
  email!: string;

  @ApiProperty({
    description: 'User Full name, FirstName and LastName combined',
    type: String,
  })
  fullName!: string;
}

@ApiExtraModels(TerritoryLightDto)
export class FindAllTerritoriesQueryResponse {
  @ApiProperty({ required: true })
  id!: string;

  @ApiProperty({ required: true, description: 'Name of the territory' })
  name!: string;

  @ApiProperty({ description: 'Date of creation', type: Date, required: true })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Latest updated At', required: true })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Person who created the entry',
    type: String,
    required: false,
  })
  createdBy!: string;

  @ApiProperty({
    type: () => TerritoryLightDto,
    description: 'Name of the territory parent if so',
    required: false,
  })
  parentInfo!: TerritoryLightDto;

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(TerritoryLightDto) },
    required: false,
  })
  children!: TerritoryLightDto[];
}

@Injectable()
export class FindAllTerritoriesQueryHandler
  implements
    QueryHandler<FindAllTerritoriesQuery, FindAllTerritoriesQueryResponse[]>
{
  constructor(private readonly territoryProvider: TerritoriesProvider) {}

  public async handlerAsync(
    query: FindAllTerritoriesQuery
  ): Promise<FindAllTerritoriesQueryResponse[]> {
    let queryFilter = {};

    if (query.name) {
      queryFilter = {
        name: name,
      };
    }

    const territories = await this.territoryProvider.TerritoryModel.find(
      queryFilter,
      '_id name createdAt parent updatedAt updatedBy parent createdByInfo',
      {
        sort: {
          createdBy: 1,
        },
      }
    )
      .populate({
        path: 'parent',
        select: 'id name',
      })
      .lean()
      .exec();

    return territories.map((territory) => {
      return {
        id: territory._id,
        name: territory.name,
        parentInfo: territory.parent
          ? {
              id: territory?.parent?._id,
              name: territory?.parent?.name,
            }
          : null,
        createdAt: territory.createdAt,
        updatedAt: territory.updatedAt,
        createdBy: `${territory.createdByInfo.firstName} ${territory.createdByInfo.lastName}`,
      } as FindAllTerritoriesQueryResponse;
    });
  }
}
