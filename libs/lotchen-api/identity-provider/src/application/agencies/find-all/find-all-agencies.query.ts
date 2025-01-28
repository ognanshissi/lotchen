import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { AgenciesProvider } from '../agencies.provider';
import { Injectable } from '@nestjs/common';

export class FindAllAgenciesAddressDto {
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
    description: 'Coordinates of the place (Office)',
    example: '[7.5455112, -5.547545]',
  })
  coordinates!: [number];

  @ApiProperty({ type: String, required: false })
  postalCode?: string;
}

export class FindAllAgenciesQuery {}

export class FindAllAgenciesQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  territoryId!: string;

  @ApiProperty({ type: () => FindAllAgenciesAddressDto })
  address!: FindAllAgenciesAddressDto;
}

@Injectable()
export class FindAllAgenciesQueryHandler
  implements QueryHandler<never, FindAllAgenciesQueryResponse[]>
{
  constructor(private readonly agenciesProvider: AgenciesProvider) {}

  public async handlerAsync(): Promise<FindAllAgenciesQueryResponse[]> {
    const agencies = await this.agenciesProvider.AgencyModel.find({
      isDeleted: false,
    })
      .populate('territory', '_id')
      .lean()
      .exec();

    return agencies.map((agency) => {
      return {
        id: agency._id,
        name: agency.name,
        territoryId: agency.territory._id,
        address: {
          street: agency.address.street,
          city: agency.address.city,
          coordinates: agency.address.location.coordinates,
          postalCode: agency.address.postalCode,
        },
      };
    });
  }
}
