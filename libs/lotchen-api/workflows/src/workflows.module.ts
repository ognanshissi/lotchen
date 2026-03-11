import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { workflowsProviders } from './workflows.provider';
import {
  templateModuleHandlers,
  WorkflowTemplatesController,
} from './templates';
import {
  executionModuleHandlers,
  WorkflowExecutionsController,
} from './executions';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { WorkflowTriggerListener } from './engine/workflow-trigger.listener';

@Module({
  imports: [CoreModule],
  controllers: [WorkflowTemplatesController, WorkflowExecutionsController],
  providers: [
    ...workflowsProviders,
    ...templateModuleHandlers,
    ...executionModuleHandlers,
    WorkflowEngineService,
    WorkflowTriggerListener,
  ],
  exports: [WorkflowEngineService],
})
export class WorkflowsModule {}
