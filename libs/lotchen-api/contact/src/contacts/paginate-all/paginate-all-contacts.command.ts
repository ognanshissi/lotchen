import {
  AuditUserInfoDto,
  CommandHandler,
  FilterDto,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Injectable } from '@nestjs/common';

export class FilterAllContactsCommand {
  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by fullName',
  })
  fullName?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by email',
  })
  email?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by mobileNumber',
  })
  mobileNumber?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by status (eq or in)',
  })
  status?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by source (eq or in)',
  })
  source?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by territoryId',
  })
  territoryId?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by agencyId',
  })
  agencyId?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by assignedToTeamId',
  })
  assignedToTeamId?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by assignedToUserId',
  })
  assignedToUserId?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by tags (contain)',
  })
  tags?: FilterDto<string>;

  @ApiPropertyOptional({
    type: () => FilterDto<string>,
    description: 'Filter by createdAt (gte, lte)',
  })
  createdAt?: FilterDto<string>;
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

  @ApiPropertyOptional({ description: 'Contact status', type: String })
  status!: string;

  @ApiPropertyOptional({ description: 'Contact source', type: String })
  source!: string;

  @ApiPropertyOptional({ description: 'Assigned user ID', type: String })
  assignedToUserId!: string | null;
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

    if (command.filters?.status) {
      const f = command.filters.status;
      if (f.operator === 'in' && Array.isArray(f.value)) {
        queryFilter.status = { $in: f.value };
      } else {
        queryFilter.status = f.value;
      }
    }

    if (command.filters?.source) {
      const f = command.filters.source;
      if (f.operator === 'in' && Array.isArray(f.value)) {
        queryFilter.source = { $in: f.value };
      } else {
        queryFilter.source = f.value;
      }
    }

    if (command.filters?.territoryId) {
      queryFilter.territoryId = command.filters.territoryId.value;
    }

    if (command.filters?.agencyId) {
      queryFilter.agencyId = command.filters.agencyId.value;
    }

    if (command.filters?.assignedToTeamId) {
      queryFilter.assignedToTeamId = command.filters.assignedToTeamId.value;
    }

    if (command.filters?.assignedToUserId) {
      queryFilter.assignedToUserId = command.filters.assignedToUserId.value;
    }

    if (command.filters?.tags) {
      queryFilter.tags = filterQueryGenerator(command.filters.tags);
    }

    if (command.filters?.createdAt) {
      queryFilter.createdAt = filterQueryGenerator(command.filters.createdAt);
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
      status: 1,
      source: 1,
      assignedToUserId: 1,
    };

    const totalDocuments =
      await this.contactProvider.ContactModel.countDocuments(queryFilter)
        .lean()
        .exec();

    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const sortStage = command.fullTextSearch
      ? { $sort: { score: { $meta: 'textScore' } } as Record<string, any> }
      : { $sort: { createdAt: -1 } as Record<string, any> };

    const results = await this.contactProvider.ContactModel.aggregate([
      { $match: queryFilter },
      ...(Object.keys(addFields).length ? [{ $addFields: addFields }] : []),
      sortStage,
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $limit: command.pageSize },
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
            createdByInfo: item.createdByInfo,
            score: item.score,
            status: item.status,
            source: item.source,
            assignedToUserId: item.assignedToUserId ?? null,
          } satisfies PaginateAllContactsCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllContactsCommandResponse;
  }
}
