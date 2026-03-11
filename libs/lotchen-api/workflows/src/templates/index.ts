export * from './create/create-workflow-template.command';
export * from './update/update-workflow-template.command';
export * from './find-by-id/find-workflow-template-by-id.query';
export * from './find-all/find-all-workflow-templates.query';
export * from './delete/delete-workflow-template.command';
export * from './activate/activate-workflow-template.command';
export * from './archive/archive-workflow-template.command';
export * from './duplicate/duplicate-workflow-template.command';
export * from './workflow-templates.controller';
export * from './workflow-template.schema';

import { CreateWorkflowTemplateCommandHandler } from './create/create-workflow-template.command';
import { UpdateWorkflowTemplateCommandHandler } from './update/update-workflow-template.command';
import { FindWorkflowTemplateByIdQueryHandler } from './find-by-id/find-workflow-template-by-id.query';
import { FindAllWorkflowTemplatesQueryHandler } from './find-all/find-all-workflow-templates.query';
import { DeleteWorkflowTemplateCommandHandler } from './delete/delete-workflow-template.command';
import { ActivateWorkflowTemplateCommandHandler } from './activate/activate-workflow-template.command';
import { ArchiveWorkflowTemplateCommandHandler } from './archive/archive-workflow-template.command';
import { DuplicateWorkflowTemplateCommandHandler } from './duplicate/duplicate-workflow-template.command';

export const templateModuleHandlers = [
  CreateWorkflowTemplateCommandHandler,
  UpdateWorkflowTemplateCommandHandler,
  FindWorkflowTemplateByIdQueryHandler,
  FindAllWorkflowTemplatesQueryHandler,
  DeleteWorkflowTemplateCommandHandler,
  ActivateWorkflowTemplateCommandHandler,
  ArchiveWorkflowTemplateCommandHandler,
  DuplicateWorkflowTemplateCommandHandler,
];
