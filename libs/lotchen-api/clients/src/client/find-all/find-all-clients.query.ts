import {
  CommandHandler,
  FilterDto,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ClientsProvider } from '../../clients.provider';
import { Injectable } from '@nestjs/common';

export class FilterAllClientsCommand {
  @ApiPropertyOptional({ type: () => FilterDto<string> })
  status?: FilterDto<string>;

  @ApiPropertyOptional({ type: () => FilterDto<string> })
  kycStatus?: FilterDto<string>;

  @ApiPropertyOptional({ type: () => FilterDto<string> })
  accountType?: FilterDto<string>;

  @ApiPropertyOptional({ type: () => FilterDto<string> })
  assignedToUserId?: FilterDto<string>;

  @ApiPropertyOptional({ type: () => FilterDto<string> })
  territoryId?: FilterDto<string>;

  @ApiPropertyOptional({ type: () => FilterDto<string> })
  createdAt?: FilterDto<string>;
}

@ApiExtraModels(FilterAllClientsCommand)
export class PaginateAllClientsRequest extends PaginationRequest {
  @ApiProperty({ type: () => FilterAllClientsCommand })
  filters!: FilterAllClientsCommand;

  @ApiProperty({
    description:
      'Full-Text search on firstName, lastName, email, mobileNumber, clientNumber',
  })
  fullTextSearch!: string;
}

export class PaginateAllClientsDto {
  @ApiProperty() id!: string;
  @ApiProperty() clientNumber!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiPropertyOptional() email?: string;
  @ApiProperty() mobileNumber!: string;
  @ApiPropertyOptional() status?: string;
  @ApiPropertyOptional() kycStatus?: string;
  @ApiPropertyOptional() accountType?: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional() score?: number;
}

export class PaginateAllClientsResponse extends Pagination<PaginateAllClientsDto> {}

@Injectable()
export class FindAllClientsQueryHandler
  implements
    CommandHandler<PaginateAllClientsRequest, PaginateAllClientsResponse>
{
  constructor(private readonly clientsProvider: ClientsProvider) {}

  async handlerAsync(
    command: PaginateAllClientsRequest
  ): Promise<PaginateAllClientsResponse> {
    let queryFilter: Record<string, any> = { deletedAt: null };

    if (command.filters?.status) {
      const f = command.filters.status;
      if (f.operator === 'in' && Array.isArray(f.value)) {
        queryFilter['status'] = { $in: f.value };
      } else {
        queryFilter['status'] = f.value;
      }
    }

    if (command.filters?.kycStatus) {
      const f = command.filters.kycStatus;
      if (f.operator === 'in' && Array.isArray(f.value)) {
        queryFilter['kycStatus'] = { $in: f.value };
      } else {
        queryFilter['kycStatus'] = f.value;
      }
    }

    if (command.filters?.accountType) {
      queryFilter['accountType'] = command.filters.accountType.value;
    }

    if (command.filters?.assignedToUserId) {
      queryFilter['assignedToUserId'] = command.filters.assignedToUserId.value;
    }

    if (command.filters?.territoryId) {
      queryFilter['territoryId'] = command.filters.territoryId.value;
    }

    if (command.filters?.createdAt) {
      queryFilter['createdAt'] = filterQueryGenerator(
        command.filters.createdAt
      );
    }

    let addFields = {};

    if (command.fullTextSearch) {
      queryFilter = {
        ...queryFilter,
        $text: { $search: command.fullTextSearch },
      };
      addFields = { score: { $meta: 'textScore' } };
    }

    const projection: Record<string, number> = {
      _id: 1,
      clientNumber: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      mobileNumber: 1,
      status: 1,
      kycStatus: 1,
      accountType: 1,
      createdAt: 1,
      updatedAt: 1,
      score: 1,
    };

    const totalDocuments =
      await this.clientsProvider.ClientModel.countDocuments(queryFilter)
        .lean()
        .exec();
    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const sortStage = command.fullTextSearch
      ? { $sort: { score: { $meta: 'textScore' } } as Record<string, any> }
      : { $sort: { createdAt: -1 } as Record<string, any> };

    const results = await this.clientsProvider.ClientModel.aggregate([
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
      totalPages,
      data: results.map(
        (item) =>
          ({
            id: item._id,
            clientNumber: item.clientNumber,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            mobileNumber: item.mobileNumber,
            status: item.status,
            kycStatus: item.kycStatus,
            accountType: item.accountType,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            score: item.score,
          } satisfies PaginateAllClientsDto)
      ),
    } satisfies PaginateAllClientsResponse;
  }
}
