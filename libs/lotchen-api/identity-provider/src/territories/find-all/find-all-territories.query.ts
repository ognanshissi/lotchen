import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../territories.provider';

export class FindAllTerritoriesQuery {}

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

export class FindAllTerritoriesQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Date of creation', type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Latest updated At' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Person who created the entry',
    type: String,
  })
  createdBy!: string;
}

@Injectable()
export class FindAllTerritoriesQueryHandler
  implements QueryHandler<never, FindAllTerritoriesQueryResponse[]>
{
  constructor(private readonly territoryProvider: TerritoriesProvider) {}

  public async handlerAsync(): Promise<FindAllTerritoriesQueryResponse[]> {
    const territories = await this.territoryProvider.TerritoryModel.find(
      {},
      '_id name createdAt createdBy updatedAt updatedBy parent'
    )
      .lean()
      .exec();

    return territories.map((territory) => {
      return {
        id: territory._id,
        name: territory.name,
        createdAt: territory.createdAt,
        updatedAt: territory.updatedAt,
        createdBy: territory.createdBy,
      } as FindAllTerritoriesQueryResponse;
    });
  }
}
