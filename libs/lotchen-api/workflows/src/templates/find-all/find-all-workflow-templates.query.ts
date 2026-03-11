import { QueryHandler } from '@lotchen/api/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { WorkflowsProvider } from '../../workflows.provider';

export class FindAllWorkflowTemplatesQuery {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;
}

@Injectable()
export class FindAllWorkflowTemplatesQueryHandler
  implements QueryHandler<FindAllWorkflowTemplatesQuery, any[]>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(query: FindAllWorkflowTemplatesQuery): Promise<any[]> {
    const filter: Record<string, any> = { deletedAt: null };

    if (query.status) {
      filter['status'] = query.status;
    }

    return this.workflowsProvider.WorkflowTemplateModel.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
  }
}
