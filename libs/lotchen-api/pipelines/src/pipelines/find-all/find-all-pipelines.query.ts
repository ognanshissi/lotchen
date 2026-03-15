import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class FindAllPipelinesQuery {}

@Injectable()
export class FindAllPipelinesQueryHandler
  implements QueryHandler<FindAllPipelinesQuery, any[]>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(_query: FindAllPipelinesQuery): Promise<any[]> {
    return this.pipelinesProvider.SalesPipelineModel.find({
      deletedAt: null,
    })
      .sort({ updatedAt: -1 })
      .lean();
  }
}
