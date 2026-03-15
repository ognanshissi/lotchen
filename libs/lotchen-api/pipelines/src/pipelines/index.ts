export * from './create/create-pipeline.command';
export * from './update/update-pipeline.command';
export * from './find-by-id/find-pipeline-by-id.query';
export * from './find-all/find-all-pipelines.query';
export * from './delete/delete-pipeline.command';
export * from './set-default/set-default-pipeline.command';
export * from './sales-pipelines.controller';
export * from './pipeline.schema';

import { CreatePipelineCommandHandler } from './create/create-pipeline.command';
import { UpdatePipelineCommandHandler } from './update/update-pipeline.command';
import { FindPipelineByIdQueryHandler } from './find-by-id/find-pipeline-by-id.query';
import { FindAllPipelinesQueryHandler } from './find-all/find-all-pipelines.query';
import { DeletePipelineCommandHandler } from './delete/delete-pipeline.command';
import { SetDefaultPipelineCommandHandler } from './set-default/set-default-pipeline.command';

export const pipelineModuleHandlers = [
  CreatePipelineCommandHandler,
  UpdatePipelineCommandHandler,
  FindPipelineByIdQueryHandler,
  FindAllPipelinesQueryHandler,
  DeletePipelineCommandHandler,
  SetDefaultPipelineCommandHandler,
];
