import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignsProvider } from '../../campaigns.provider';
import { AudienceFilterDto } from '../create/create-campaign.command';
import { ContactProvider } from '@lotchen/lotchen-api/contact';

export class EstimateAudienceQuery {
  @ApiProperty({
    type: [AudienceFilterDto],
    description:
      'Filters to apply to the contact list to estimate the audience size',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudienceFilterDto)
  filters!: AudienceFilterDto[];
}

@Injectable()
export class EstimateAudienceQueryHandler
  implements QueryHandler<EstimateAudienceQuery, { count: number }>
{
  constructor(
    private readonly campaignsProvider: CampaignsProvider,
    private readonly contactProvider: ContactProvider
  ) {}

  async handlerAsync(query: EstimateAudienceQuery): Promise<{ count: number }> {
    const mongoFilter = this.buildMongoFilter(query.filters);
    mongoFilter['deletedAt'] = null;

    const count = await this.contactProvider.ContactModel.countDocuments(
      mongoFilter
    );

    return { count };
  }

  /**
   *
   * @param filters AudienceFilterDto[] - array of filters to apply to the contact list
   * The filter operators can be:
   * - eq: equal to
   * - in: value is in array
   * - contains: value is contained in the field (case insensitive)
   * @returns Records<string, any> - MongoDB filter object to apply to the contact collection
   * Example:
   * filters: [
   *   { field: 'country', operator: 'eq', value: 'USA' },
   *   { field: 'age', operator: 'in', value: [25, 30, 35] },
   *   { field: 'tags', operator: 'contains', value: 'vip' }
   * ]
   *
   * Resulting MongoDB filter:
   * {
   *   country: 'USA',
   *   age: { $in: [25, 30, 35] },
   *   tags: { $regex: 'vip', $options: 'i' },
   * }
   */
  private buildMongoFilter(filters: AudienceFilterDto[]): Record<string, any> {
    const mongoFilter: Record<string, any> = {};

    for (const filter of filters) {
      switch (filter.operator) {
        case 'eq':
          mongoFilter[filter.field] = filter.value;
          break;
        case 'in':
          mongoFilter[filter.field] = {
            $in: Array.isArray(filter.value) ? filter.value : [filter.value],
          };
          break;
        case 'contains':
          mongoFilter[filter.field] = {
            $regex: filter.value,
            $options: 'i',
          };
          break;
        default:
          mongoFilter[filter.field] = filter.value;
      }
    }

    return mongoFilter;
  }
}
