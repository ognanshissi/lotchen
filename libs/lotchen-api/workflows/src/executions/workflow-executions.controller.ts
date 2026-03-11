import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindExecutionByIdQueryHandler } from './find-by-id/find-execution-by-id.query';
import {
  FindAllExecutionsQuery,
  FindAllExecutionsQueryHandler,
} from './find-all/find-all-executions.query';
import {
  RetryExecutionStepCommandRequest,
  RetryExecutionStepCommandHandler,
} from './retry-step/retry-execution-step.command';
import {
  SkipExecutionStepCommandRequest,
  SkipExecutionStepCommandHandler,
} from './skip-step/skip-execution-step.command';
import { CancelExecutionCommandHandler } from './cancel/cancel-execution.command';
import {
  TriggerManualWorkflowCommand,
  TriggerManualWorkflowCommandHandler,
} from './trigger-manual/trigger-manual-workflow.command';
import { ExecutionDashboardQueryHandler } from './dashboard/execution-dashboard.query';
import {
  TestRunWorkflowCommand,
  TestRunWorkflowCommandHandler,
} from './test-run/test-run-workflow.command';
import { ImportContactsExcelCommandResponse } from '../../../contact/src/contacts/import-contacts-excel/import-contacts-excel.command';

@Controller({ path: 'workflow-executions', version: '1' })
@ApiTags('Workflow Executions')
export class WorkflowExecutionsController {
  constructor(
    private readonly _findByIdHandler: FindExecutionByIdQueryHandler,
    private readonly _findAllHandler: FindAllExecutionsQueryHandler,
    private readonly _retryStepHandler: RetryExecutionStepCommandHandler,
    private readonly _skipStepHandler: SkipExecutionStepCommandHandler,
    private readonly _cancelHandler: CancelExecutionCommandHandler,
    private readonly _triggerManualHandler: TriggerManualWorkflowCommandHandler,
    private readonly _dashboardHandler: ExecutionDashboardQueryHandler,
    private readonly _testRunHandler: TestRunWorkflowCommandHandler
  ) {}

  @Get('dashboard')
  public async getDashboard(): Promise<any> {
    return this._dashboardHandler.handlerAsync({});
  }

  @Post('trigger')
  @HttpCode(HttpStatus.CREATED)
  public async triggerManual(
    @Body() command: TriggerManualWorkflowCommand
  ): Promise<any> {
    return this._triggerManualHandler.handlerAsync(command);
  }

  @Post('test-run')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 200,
    description: 'Import summary',
    type: ImportContactsExcelCommandResponse,
  })
  public async testRun(@Body() command: TestRunWorkflowCommand): Promise<any> {
    return this._testRunHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(@Query() query: FindAllExecutionsQuery): Promise<any[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  public async findById(@Param('id') id: string): Promise<any> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id/retry-step')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async retryStep(
    @Param('id') id: string,
    @Body() request: RetryExecutionStepCommandRequest
  ): Promise<void> {
    return this._retryStepHandler.handlerAsync({ id, ...request });
  }

  @Patch(':id/skip-step')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async skipStep(
    @Param('id') id: string,
    @Body() request: SkipExecutionStepCommandRequest
  ): Promise<void> {
    return this._skipStepHandler.handlerAsync({ id, ...request });
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async cancel(@Param('id') id: string): Promise<void> {
    return this._cancelHandler.handlerAsync({ id });
  }
}
