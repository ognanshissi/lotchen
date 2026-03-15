import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class FindDealByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class FindDealByIdQueryHandler
  implements QueryHandler<FindDealByIdQuery, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(query: FindDealByIdQuery): Promise<any> {
    const deal = await this.pipelinesProvider.DealModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }
}
