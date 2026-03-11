import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { WorkflowsProvider } from '../../workflows.provider';
import { StepStatusEnum } from '../../common/workflow.enums';

export class FindAllExecutionsQuery {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  workflowTemplateId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  targetEntityId?: string;
}

export class FindAllExecutionsQueryResponse {
  workflowTemplateId!: string;
  workflowName!: string;
  workflowVersion!: number;
  status!: string;
  triggerType!: any;
  triggeredByUserId!: any;
  targetEntityId!: any;
  targetEntityType!: string;
  currentNodeId!: string;
  stepLogs!: string;
  completedAt!: Date;
  triggerPayload: any;
  testMode!: boolean;
}

@Injectable()
export class FindAllExecutionsQueryHandler
  implements
    QueryHandler<FindAllExecutionsQuery, FindAllExecutionsQueryResponse[]>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(
    query: FindAllExecutionsQuery
  ): Promise<FindAllExecutionsQueryResponse[]> {
    const filter: Record<string, any> = {};

    if (query.workflowTemplateId)
      filter['workflowTemplateId'] = query.workflowTemplateId;
    if (query.status) filter['status'] = query.status;
    if (query.targetEntityId) filter['targetEntityId'] = query.targetEntityId;

    const result = await this.workflowsProvider.WorkflowExecutionModel.find(
      filter
    )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return result as unknown as FindAllExecutionsQueryResponse[];
  }
}
