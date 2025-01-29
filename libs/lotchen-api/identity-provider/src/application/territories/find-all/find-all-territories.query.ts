import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../territories.provider';

export class FindAllTerritoriesQuery {}

export class FindAllTerritoriesQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

@Injectable()
export class FindAllTerritoriesQueryHandler
  implements QueryHandler<never, FindAllTerritoriesQueryResponse[]>
{
  constructor(private readonly territoryProvider: TerritoriesProvider) {}

  public async handlerAsync(): Promise<FindAllTerritoriesQueryResponse[]> {
    const territories = await this.territoryProvider.TerritoryModel.find(
      {}
    ).exec();

    return territories.map((territory) => {
      return {
        id: territory.id,
        name: territory.name,
      } as FindAllTerritoriesQueryResponse;
    });
  }
}
