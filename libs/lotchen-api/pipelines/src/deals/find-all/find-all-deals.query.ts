import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';

export class FindAllDealsQuery {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  pipelineId!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  stageId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

@Injectable()
export class FindAllDealsQueryHandler
  implements QueryHandler<FindAllDealsQuery, any[]>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(query: FindAllDealsQuery): Promise<any[]> {
    const filter: Record<string, any> = {
      pipelineId: query.pipelineId,
      deletedAt: null,
    };

    if (query.stageId) filter['stageId'] = query.stageId;
    if (query.outcome) filter['outcome'] = query.outcome;
    if (query.assignedTo) filter['assignedTo'] = query.assignedTo;

    return this.pipelinesProvider.DealModel.find(filter)
      .sort({ order: 1 })
      .lean();
  }
}
