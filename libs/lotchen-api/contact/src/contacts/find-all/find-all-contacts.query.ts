import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactDocument } from '../contact.schema';
import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactProvider } from '../contact.provider';
import { QueryHandler } from '@lotchen/api/core';

export class FindAllContactsQuery {
  @ApiProperty({
    required: false,
    description: 'Fields to return',
    type: String,
  })
  fields!: string;

  @ApiProperty({
    required: false,
    description: 'Filter by email',
    type: String,
  })
  email!: string;

  @ApiProperty({
    required: false,
    description: 'Filter by mobile number',
    type: String,
  })
  mobileNumber!: string;

  @ApiProperty({
    required: false,
    description: 'Filter by first name',
    type: String,
  })
  firstName!: string;

  @ApiProperty({
    required: false,
    description: 'Filter by last name',
    type: String,
  })
  lastName!: string;
}

export class FindAllContactsQueryResponse {
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

  @ApiProperty({
    required: false,
    description: 'Source of the lead',
    type: String,
  })
  source!: string;

  @ApiProperty({ required: false, description: 'Date of birth', type: Date })
  dateOfBirth!: Date;

  @ApiProperty({ required: false, description: 'Date of creation', type: Date })
  createdAt!: Date;

  @ApiProperty({ required: false, description: 'Date of update', type: Date })
  updatedAt!: Date;

  @ApiProperty({ required: false, description: 'Contact status', type: String })
  status!: string;

  @ApiPropertyOptional({ description: 'Assigned user ID', type: String })
  assignedToUserId!: string | null;

  @ApiPropertyOptional({ description: 'Assigned team ID', type: String })
  assignedToTeamId!: string | null;

  @ApiPropertyOptional({ description: 'Territory ID', type: String })
  territoryId!: string | null;
}

@Injectable()
export class FindAllContactsQueryHandler
  implements QueryHandler<FindAllContactsQuery, FindAllContactsQueryResponse[]>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(
    query: FindAllContactsQuery
  ): Promise<FindAllContactsQueryResponse[]> {
    try {
      return await this.findAllContactsAsync(
        this.contactProvider.ContactModel,
        query
      );
    } catch (error) {
      throw new BadRequestException('Error while fetching contacts');
    }
  }

  private async findAllContactsAsync(
    contactModel: Model<ContactDocument>,
    query: FindAllContactsQuery
  ): Promise<FindAllContactsQueryResponse[]> {
    // projection
    let projection =
      'id email firstName lastName source mobileNumber dateOfBirth address createdAt updatedAt status assignedToUserId assignedToTeamId territoryId';

    if (query.fields) {
      projection = query.fields
        .replace('timestamps', 'createdAt,updatedAt')
        .split(',')
        .join(' ');
    }

    // queryFilter
    let queryFilter: Record<string, any> = { deletedAt: null };
    if (query.email) {
      queryFilter = { ...queryFilter, email: new RegExp(query.email, 'i') };
    }

    if (query.mobileNumber) {
      queryFilter = { ...queryFilter, mobileNumber: query.mobileNumber };
    }

    if (query.firstName) {
      queryFilter = {
        ...queryFilter,
        firstName: new RegExp(query.firstName, 'i'),
      };
    }

    if (query.lastName) {
      queryFilter = {
        ...queryFilter,
        lastName: new RegExp(query.lastName, 'i'),
      };
    }

    const contacts = await contactModel
      .find(queryFilter, projection, { sort: { createdAt: -1 } })
      .exec();
    return contacts.map((contact) => {
      return {
        id: contact._id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        source: contact.source,
        mobileNumber: contact.mobileNumber,
        dateOfBirth: contact.dateOfBirth,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        status: contact.status,
        assignedToUserId: contact.assignedToUserId ?? null,
        assignedToTeamId: contact.assignedToTeamId ?? null,
        territoryId: contact.territoryId ?? null,
      };
    });
  }
}
