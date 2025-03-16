import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@lotchen/api/core';
import { TerritoriesProvider } from '../territories.provider';
import {
  FindAllTerritoriesQuery,
  FindAllTerritoriesQueryResponse,
} from './find-all-territories.query';

@Injectable()
export class FindAllTerritoriesQueryHandler
  implements
    QueryHandler<FindAllTerritoriesQuery, FindAllTerritoriesQueryResponse[]>
{
  constructor(private readonly territoryProvider: TerritoriesProvider) {}

  public async handlerAsync(
    query: FindAllTerritoriesQuery
  ): Promise<FindAllTerritoriesQueryResponse[]> {
    // Create a query filter object
    let queryFilter = {};

    if (query.name) {
      queryFilter = { ...queryFilter, name: new RegExp(query.name, 'i') };
    }

    if (query.isDeleted) {
      queryFilter = { ...queryFilter, isDeletedAt: null };
    }

    // projection
    let projection =
      '_id name createdAt parent updatedAt updatedBy createdByInfo';

    if (query.fields) {
      projection = query.fields
        .replace('timestamps', 'createdAt,updatedAt')
        .split(',')
        .join(' ');
    }

    const territories = await this.territoryProvider.TerritoryModel.find(
      queryFilter,
      projection,
      {
        sort: {
          createdBy: -1,
        },
        limit: query.limit,
      }
    )
      .populate({
        path: 'parent',
        select: 'id name',
      })
      .lean()
      .exec();

    return territories.map((territory) => {
      return {
        id: territory._id,
        name: territory.name,
        parentInfo:
          territory?.parent && projection?.includes('parent')
            ? {
                id: territory?.parent?._id,
                name: territory?.parent?.name,
              }
            : undefined,
        createdAt: territory?.createdAt,
        updatedAt: territory?.updatedAt,
        createdByInfo: territory?.createdByInfo
          ? {
              id: territory?.createdByInfo?.userId,
              email: territory?.createdByInfo?.email,
              fullName: `${territory?.createdByInfo?.firstName} ${territory?.createdByInfo?.lastName}`,
            }
          : undefined,
      } as FindAllTerritoriesQueryResponse;
    });
  }
}
