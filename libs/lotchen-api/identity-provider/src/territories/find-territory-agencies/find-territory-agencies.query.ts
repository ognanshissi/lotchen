import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { TerritoriesProvider } from '../territories.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

class FindTerritoryAgenciesAddressDto {
  @ApiProperty({
    description: 'Street',
    example: 'Avenue Fadiga',
  })
  street!: string;

  @ApiProperty({
    description: 'City',
    example: 'Abidjan',
  })
  city!: string;

  @ApiProperty({
    type: [Number],
    required: false,
    description:
      'Coordinates of the place (Office), probably a known country such as Ivory Coast',
    example: '[7.5455112, -5.547545]',
  })
  coordinates!: [number];

  @ApiProperty({ type: String, required: false })
  postalCode?: string;
}

export class FindTerritoryAgenciesQuery {
  id!: string;
}

export class FindTerritoryAgenciesQueryResponse {
  @ApiProperty({ description: 'Agency Id' })
  id!: string;

  @ApiProperty()
  name!: string;

  // @ApiProperty({
  //   type: Boolean,
  //   description: 'Indicate if the agency is the main agency',
  // })
  // isPrincipalAgency!: boolean;
  //
  // @ApiProperty({ type: () => FindTerritoryAgenciesAddressDto })
  // address!: FindTerritoryAgenciesAddressDto;
}

@Injectable()
export class FindTerritoryAgenciesQueryHandler
  implements
    QueryHandler<
      FindTerritoryAgenciesQuery,
      FindTerritoryAgenciesQueryResponse[]
    >
{
  constructor(private readonly territoriesProvider: TerritoriesProvider) {}

  public async handlerAsync(
    query: FindTerritoryAgenciesQuery
  ): Promise<FindTerritoryAgenciesQueryResponse[]> {
    const territory = await this.territoriesProvider.TerritoryModel.findOne({
      _id: query.id,
    })
      .populate('children')
      .lean()
      .exec();

    if (!territory) {
      throw new NotFoundException('Territory not found !');
    }

    return territory.children.map((territory) => {
      return {
        id: territory._id,
        name: territory.name,
      };
    });
  }
}
