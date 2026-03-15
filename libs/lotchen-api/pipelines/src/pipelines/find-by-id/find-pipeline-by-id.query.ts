import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class FindPipelineByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class FindPipelineByIdQueryHandler
  implements QueryHandler<FindPipelineByIdQuery, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(query: FindPipelineByIdQuery): Promise<any> {
    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    return pipeline;
  }
}
