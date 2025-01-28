import { ApiProperty } from '@nestjs/swagger';
import { CreateAgencyAddressDto } from '../create/create-agency.command';
import { QueryHandler } from '@lotchen/api/core';
import { AgenciesProvider } from '../agencies.provider';
import { NotFoundException } from '@nestjs/common';

export class FindAgencyByIdAddressDto extends CreateAgencyAddressDto {}

export class FindAgencyByIdQuery {
  id!: string;
}

export class FindAgencyByIdQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: Boolean,
    description: 'Indicate if the agency is the main agency',
  })
  isPrincipalAgency!: boolean;

  @ApiProperty({ type: () => FindAgencyByIdAddressDto })
  address!: FindAgencyByIdAddressDto;
}

export class FindAgencyByIdQueryHandler
  implements QueryHandler<FindAgencyByIdQuery, FindAgencyByIdQueryResponse>
{
  constructor(private readonly agenciesProvider: AgenciesProvider) {}

  public async handlerAsync(
    query: FindAgencyByIdQuery
  ): Promise<FindAgencyByIdQueryResponse> {
    const agency = await this.agenciesProvider.AgencyModel.findOne({
      _id: query.id,
      isDeleted: false,
    }).lean();

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    return {
      id: agency._id,
      name: agency.name,
      isPrincipalAgency: agency.isPrincipalAgency,
      address: {
        street: agency.address.street,
        city: agency.address.city,
        coordinates: agency.address.location.coordinates,
        postalCode: agency.address.postalCode,
      },
    };
  }
}
