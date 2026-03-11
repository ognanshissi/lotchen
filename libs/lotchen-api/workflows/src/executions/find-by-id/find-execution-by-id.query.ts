import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';

export class FindExecutionByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class FindExecutionByIdQueryHandler
  implements QueryHandler<FindExecutionByIdQuery, any>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(query: FindExecutionByIdQuery): Promise<any> {
    const execution =
      await this.workflowsProvider.WorkflowExecutionModel.findById(
        query.id
      ).lean();

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    return execution;
  }
}
