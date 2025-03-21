import { Address, AddressDto, QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';

export class FindContactByIdQuery {
  @ApiProperty({
    required: true,
    description: 'Id',
    type: String,
  })
  id!: string;
}

export class FindContactByIdQueryResponse {
  @ApiProperty({ required: true, description: 'Id', type: String })
  id!: string;

  @ApiProperty({ required: false, description: 'Email', type: String })
  email!: string;

  @ApiProperty({ required: false, description: 'First name', type: String })
  firstName!: string;

  @ApiProperty({ required: false, description: 'Last name', type: String })
  lastName!: string;

  @ApiProperty({ required: false, description: 'Mobile number', type: String })
  mobileNumber!: string;

  @ApiProperty({ required: false, description: 'Date of birth', type: Date })
  dateOfBirth!: Date;

  @ApiProperty({ required: false, description: 'Date of creation', type: Date })
  createdAt!: Date;

  @ApiProperty({
    required: false,
    description: 'Address',
    items: { $ref: getSchemaPath(AddressDto) },
    type: 'array',
  })
  addresses!: AddressDto[] | [];

  @ApiProperty({ type: String, description: 'Job title' })
  jobTitle!: string;

  @ApiProperty({ type: String, description: 'Contact source' })
  source!: string;
}

@Injectable()
export class FindContactByQueryHandler
  implements QueryHandler<FindContactByIdQuery, FindContactByIdQueryResponse>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(
    query: FindContactByIdQuery
  ): Promise<FindContactByIdQueryResponse> {
    const contact = await this.contactProvider.ContactModel.findById(
      query.id,
      'id email firstName lastName mobileNumber dateOfBirth address createdAt updatedAt jobTitle source'
    )
      .lean()
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return {
      id: contact._id,
      email: contact.email,
      jobTitle: contact.jobTitle,
      source: contact.source,
      firstName: contact.firstName,
      lastName: contact.lastName,
      mobileNumber: contact.mobileNumber,
      dateOfBirth: contact.dateOfBirth,
      createdAt: contact.createdAt,
      addresses: (contact.addresses ?? []).map((address: Address) => ({
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        state: address.state,
        isDefaultAddress: address.isDefaultAddress,
        country: address.country,
        location: {
          type: address.location?.type,
          coordinates: address.location?.coordinates,
        },
      })),
    };
  }
}
