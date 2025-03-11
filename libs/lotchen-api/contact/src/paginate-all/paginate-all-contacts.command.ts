import {
  AuditUserInfoDto,
  CommandHandler,
  FilterDto,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Injectable } from '@nestjs/common';

export class FilterAllContactsCommand {
  @ApiProperty({
    type: () => FilterDto<string>,
    description: 'Filter by fullName',
  })
  fullName!: FilterDto<string>;

  @ApiProperty({
    type: () => FilterDto<string>,
    description: 'Filter by email',
  })
  email!: FilterDto<string>;

  @ApiProperty({
    type: () => FilterDto<string>,
    description: 'Filter by mobileNumber',
  })
  mobileNumber!: FilterDto<string>;
}

@ApiExtraModels(FilterAllContactsCommand)
export class PaginateAllContactsCommandRequest extends PaginationRequest {
  @ApiProperty({
    type: () => FilterAllContactsCommand,
    description: 'Filters for the query',
  })
  filters!: FilterAllContactsCommand;

  @ApiProperty({
    description:
      'Full-Text search on following fields: firstName, lastname, email, mobileNumber',
  })
  fullTextSearch!: string;
}

export class PaginateAllContactsCommand extends PaginateAllContactsCommandRequest {
  @ApiProperty({
    description: 'Fields to return',
    type: String,
    required: false,
  })
  fields!: string;
}

export class PaginateAllContactsCommandDto {
  @ApiProperty({ description: 'Contact Id', type: String, required: false })
  id!: string;

  @ApiProperty({ description: 'Contact email', type: String })
  email!: string;

  @ApiProperty({ description: 'Contact firstName', type: String })
  firstName!: string;

  @ApiProperty({ description: 'Contact lastName', type: String })
  lastName!: string;

  @ApiProperty({ description: 'Contact mobile number', type: String })
  mobileNumber!: string;

  @ApiProperty({
    type: () => AuditUserInfoDto,
    description: 'User information who created the record',
  })
  createdByInfo!: AuditUserInfoDto | undefined;

  @ApiProperty({ type: Date, description: 'Date of creation' })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Date of update' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Record score', type: Number, default: 0 })
  score!: number;
}

export class PaginateAllContactsCommandResponse extends Pagination<PaginateAllContactsCommandDto> {}

@Injectable()
export class PaginateAllContactsCommandHandler
  implements
    CommandHandler<
      PaginateAllContactsCommand,
      PaginateAllContactsCommandResponse
    >
{
  constructor(private readonly contactProvider: ContactProvider) {}
  public async handlerAsync(
    command: PaginateAllContactsCommand
  ): Promise<PaginateAllContactsCommandResponse> {
    // Dynamic filter query builder
    let queryFilter: { [key: string]: any } = { deletedAt: null };

    if (command.filters?.email) {
      queryFilter = {
        ...queryFilter,
        email: filterQueryGenerator(command.filters.email),
      };
    }

    if (command.filters?.mobileNumber) {
      queryFilter = {
        ...queryFilter,
        mobileNumber: filterQueryGenerator(command.filters.mobileNumber),
      };
    }
    let addFields = {};

    if (command.fullTextSearch) {
      queryFilter = {
        ...queryFilter,
        $text: { $search: command.fullTextSearch },
      };
      addFields = { score: { $meta: 'textScore' } };
    }
    // Projection
    const projection: { [key: string]: number } = {
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      mobileNumber: 1,
      createdAt: 1,
      updatedAt: 1,
      updatedBy: 1,
      createdByInfo: 1,
      score: 1,
    };

    const totalDocuments =
      await this.contactProvider.ContactModel.countDocuments(queryFilter)
        .lean()
        .exec();

    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.contactProvider.ContactModel.aggregate([
      { $match: queryFilter },
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $addFields: addFields },
      { $limit: command.pageSize },
      { $sort: { score: -1 } },
      { $project: projection },
    ]).exec();

    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            id: item._id,
            email: item.email,
            mobileNumber: item.mobileNumber,
            firstName: item.firstName,
            lastName: item.lastName,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdByInfo: item.createdBy,
            score: item.score,
          } satisfies PaginateAllContactsCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllContactsCommandResponse;
  }
}
