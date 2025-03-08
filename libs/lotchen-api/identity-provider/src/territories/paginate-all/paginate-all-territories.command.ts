import {
  CommandHandler,
  FilterDto,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { TerritoryLightDto } from '../find-all/find-all-territories.query';
import { TerritoriesProvider } from '../territories.provider';

@ApiExtraModels(FilterDto)
export class FilterAllTerritoriesCommand {
  @ApiProperty({ type: () => FilterDto<string> })
  name!: FilterDto<string>;
}

@ApiExtraModels(FilterAllTerritoriesCommand)
export class PaginateAllTerritoriesCommand extends PaginationRequest {
  @ApiProperty({
    type: () => FilterAllTerritoriesCommand,
    description: '',
  })
  filters!: FilterAllTerritoriesCommand;
}

@ApiExtraModels(TerritoryLightDto)
export class PaginateAllTerritoriesCommandDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Date of creation', type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Latest updated At' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Person who created the entry',
    type: String,
  })
  createdBy!: string;

  @ApiProperty({
    type: () => TerritoryLightDto,
    description: 'Name of the territory parent if so',
  })
  parentInfo!: TerritoryLightDto | null;

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(TerritoryLightDto) },
  })
  children!: TerritoryLightDto[];
}

export class PaginateAllTerritoriesCommandResponse extends Pagination<PaginateAllTerritoriesCommandDto> {}

@Injectable()
export class PaginateAllTerritoriesCommandHandler
  implements
    CommandHandler<
      PaginateAllTerritoriesCommand,
      PaginateAllTerritoriesCommandResponse
    >
{
  constructor(private readonly territoryProvider: TerritoriesProvider) {}

  public async handlerAsync(
    command: PaginateAllTerritoriesCommand
  ): Promise<PaginateAllTerritoriesCommandResponse> {
    const queryFilter = {
      name: filterQueryGenerator(command.filters.name),
    };

    const totalDocuments =
      await this.territoryProvider.TerritoryModel.countDocuments(
        queryFilter
      ).exec();

    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.territoryProvider.TerritoryModel.aggregate([
      { $match: queryFilter },
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $limit: command.pageSize },
      { $sort: { name: 1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          createdAt: 1,
          parent: 1,
          updatedAt: 1,
          updatedBy: 1,
          createdByInfo: 1,
        },
      },
    ]).exec();
    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            id: item._id,
            name: item.name,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            parentInfo: null,
            createdBy: '',
            children: [],
          } satisfies PaginateAllTerritoriesCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllTerritoriesCommandResponse;
  }
}
