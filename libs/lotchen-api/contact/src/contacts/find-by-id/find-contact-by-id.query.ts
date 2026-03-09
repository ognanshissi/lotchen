import { Address, AddressDto, QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';

export class FindContactByIdQuery {
  @ApiProperty({
    required: true,
    description: 'Id',
    type: String,
  })
  id!: string;
}

class CreatedByInfoDto {
  @ApiProperty({ type: String })
  userId!: string;

  @ApiProperty({ type: String })
  firstName!: string;

  @ApiProperty({ type: String })
  lastName!: string;

  @ApiProperty({ type: String })
  email!: string;
}

class StatusHistoryDto {
  @ApiProperty({ type: String })
  previousStatus!: string;

  @ApiProperty({ type: String })
  status!: string;

  @ApiProperty({ type: Date })
  changedAt!: Date;

  @ApiProperty({ type: String })
  changedBy!: string;
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

  @ApiPropertyOptional({ description: 'Phone number', type: String })
  phone!: string | null;

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

  @ApiProperty({ type: String, description: 'Contact status' })
  status!: string;

  @ApiPropertyOptional({ type: String, description: 'Gender' })
  gender!: string | null;

  @ApiProperty({ type: [String], description: 'Tags' })
  tags!: string[];

  @ApiPropertyOptional({ type: String, description: 'Company name' })
  companyName!: string | null;

  @ApiPropertyOptional({ type: String, description: 'Assigned user ID' })
  assignedToUserId!: string | null;

  @ApiPropertyOptional({ type: String, description: 'Assigned team ID' })
  assignedToTeamId!: string | null;

  @ApiPropertyOptional({ type: String, description: 'Territory ID' })
  territoryId!: string | null;

  @ApiPropertyOptional({ type: String, description: 'Agency ID' })
  agencyId!: string | null;

  @ApiPropertyOptional({
    type: CreatedByInfoDto,
    description: 'Created by info',
  })
  createdByInfo!: CreatedByInfoDto | null;

  @ApiProperty({ type: [StatusHistoryDto], description: 'Status history' })
  statusHistory!: StatusHistoryDto[];
}

@Injectable()
export class FindContactByQueryHandler
  implements QueryHandler<FindContactByIdQuery, FindContactByIdQueryResponse>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(
    query: FindContactByIdQuery
  ): Promise<FindContactByIdQueryResponse> {
    const contact = await this.contactProvider.ContactModel.findOne(
      { _id: query.id, deletedAt: null },
      '_id email firstName lastName mobileNumber phone dateOfBirth addresses createdAt updatedAt jobTitle source status gender tags companyName assignedToUserId assignedToTeamId territoryId agencyId createdByInfo statusHistory'
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
      status: contact.status,
      gender: contact.gender ?? null,
      phone: contact.phone ?? null,
      tags: contact.tags ?? [],
      companyName: contact.companyName ?? null,
      assignedToUserId: contact.assignedToUserId ?? null,
      assignedToTeamId: contact.assignedToTeamId ?? null,
      territoryId: contact.territoryId ?? null,
      agencyId: contact.agencyId ?? null,
      createdByInfo: contact.createdByInfo ?? null,
      statusHistory: (contact.statusHistory ?? []).map((sh: any) => ({
        previousStatus: sh.previousStatus,
        status: sh.status,
        changedAt: sh.changedAt,
        changedBy: sh.changedBy,
      })),
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
