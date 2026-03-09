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
import { LeadProvider } from '../lead.provider';
import { Injectable } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';

export class FilterAllLeadsCommand {
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
    description: 'Filter by priority (eq or in)',
  })
  priority?: FilterDto<string>;

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

@ApiExtraModels(FilterAllLeadsCommand)
export class PaginateAllLeadsCommandRequest extends PaginationRequest {
  @ApiProperty({
    type: () => FilterAllLeadsCommand,
    description: 'Filters for the query',
  })
  filters!: FilterAllLeadsCommand;

  @ApiProperty({
    description:
      'Full-Text search on following fields: firstName, lastname, email, mobileNumber',
  })
  fullTextSearch!: string;
}

export class PaginateAllLeadsCommand extends PaginateAllLeadsCommandRequest {
  @ApiProperty({
    description: 'Fields to return',
    type: String,
    required: false,
  })
  fields!: string;
}

export class PaginateAllLeadsCommandDto {
  @ApiProperty({ description: 'Lead Id', type: String })
  id!: string;

  @ApiProperty({ description: 'Lead email', type: String })
  email!: string;

  @ApiProperty({ description: 'Lead firstName', type: String })
  firstName!: string;

  @ApiProperty({ description: 'Lead lastName', type: String })
  lastName!: string;

  @ApiProperty({ description: 'Lead mobile number', type: String })
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

  @ApiPropertyOptional({ description: 'Lead status', type: String })
  status!: string;

  @ApiPropertyOptional({ description: 'Lead source', type: String })
  source!: string;

  @ApiPropertyOptional({ description: 'Lead priority', type: String })
  priority!: string | null;

  @ApiPropertyOptional({ description: 'Product interest', type: String })
  productInterest!: string | null;

  @ApiPropertyOptional({ description: 'Estimated value', type: Number })
  estimatedValue!: number | null;

  @ApiPropertyOptional({ description: 'Assigned user ID', type: String })
  assignedToUserId!: string | null;

  @ApiPropertyOptional({ description: 'Lead score', type: Number })
  score!: number;
}

export class PaginateAllLeadsCommandResponse extends Pagination<PaginateAllLeadsCommandDto> {}

@Injectable()
export class PaginateAllLeadsCommandHandler
  implements
    CommandHandler<PaginateAllLeadsCommand, PaginateAllLeadsCommandResponse>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  public async handlerAsync(
    command: PaginateAllLeadsCommand
  ): Promise<PaginateAllLeadsCommandResponse> {
    let queryFilter: { [key: string]: any } = {
      deletedAt: null,
      type: ContactTypeEnum.Lead,
    };

    if (command.filters?.email) {
      queryFilter.email = filterQueryGenerator(command.filters.email);
    }

    if (command.filters?.mobileNumber) {
      queryFilter.mobileNumber = filterQueryGenerator(
        command.filters.mobileNumber
      );
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

    if (command.filters?.priority) {
      const f = command.filters.priority;
      if (f.operator === 'in' && Array.isArray(f.value)) {
        queryFilter['customFields.priority'] = { $in: f.value };
      } else {
        queryFilter['customFields.priority'] = f.value;
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

    const projection: { [key: string]: number } = {
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      mobileNumber: 1,
      createdAt: 1,
      updatedAt: 1,
      createdByInfo: 1,
      status: 1,
      source: 1,
      assignedToUserId: 1,
      customFields: 1,
      score: 1,
    };

    const totalDocuments = await this.leadProvider.ContactModel.countDocuments(
      queryFilter
    )
      .lean()
      .exec();

    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const sortStage = command.fullTextSearch
      ? { $sort: { score: { $meta: 'textScore' } } as Record<string, any> }
      : { $sort: { createdAt: -1 } as Record<string, any> };

    const results = await this.leadProvider.ContactModel.aggregate([
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
      data: results.map((item) => ({
        id: item._id,
        email: item.email,
        mobileNumber: item.mobileNumber,
        firstName: item.firstName,
        lastName: item.lastName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdByInfo: item.createdByInfo,
        status: item.status,
        source: item.source,
        priority: item.customFields?.priority ?? null,
        productInterest: item.customFields?.productInterest ?? null,
        estimatedValue: item.customFields?.estimatedValue
          ? Number(item.customFields.estimatedValue)
          : null,
        assignedToUserId: item.assignedToUserId ?? null,
        score: item.score ?? 0,
      })),
      totalPages,
    } satisfies PaginateAllLeadsCommandResponse;
  }
}
