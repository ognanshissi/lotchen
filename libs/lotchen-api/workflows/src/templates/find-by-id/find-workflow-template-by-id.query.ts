import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';

export class FindWorkflowTemplateByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

export class FindWorkflowTemplateByIdQueryResponse {}
@Injectable()
export class FindWorkflowTemplateByIdQueryHandler
  implements
    QueryHandler<
      FindWorkflowTemplateByIdQuery,
      FindWorkflowTemplateByIdQueryResponse
    >
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(
    query: FindWorkflowTemplateByIdQuery
  ): Promise<FindWorkflowTemplateByIdQueryResponse> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: query.id, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    return template;
  }
}
