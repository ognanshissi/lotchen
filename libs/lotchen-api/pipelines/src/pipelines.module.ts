import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { pipelinesProviders } from './pipelines.provider';
import { pipelineModuleHandlers, SalesPipelinesController } from './pipelines';
import { dealModuleHandlers, DealsController } from './deals';
import { PipelineAnalyticsQueryHandler } from './analytics/pipeline-analytics.query';

@Module({
  imports: [CoreModule],
  controllers: [SalesPipelinesController, DealsController],
  providers: [
    ...pipelinesProviders,
    ...pipelineModuleHandlers,
    ...dealModuleHandlers,
    PipelineAnalyticsQueryHandler,
  ],
})
export class PipelinesModule {}
