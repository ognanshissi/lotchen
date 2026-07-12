import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateDispatchRuleCommand,
  CreateDispatchRuleCommandHandler,
} from './create/create-dispatch-rule.command';
import {
  UpdateDispatchRuleRequest,
  UpdateDispatchRuleCommandHandler,
} from './update/update-dispatch-rule.command';
import {
  FindAllDispatchRulesQuery,
  FindAllDispatchRulesQueryHandler,
  FindAllDispatchRulesQueryResponse,
} from './find-all/find-all-dispatch-rules.query';
import {
  FindDispatchRuleByIdQueryHandler,
  FindDispatchRuleByIdQueryResponse,
} from './find-by-id/find-dispatch-rule-by-id.query';
import { DeleteDispatchRuleCommandHandler } from './delete/delete-dispatch-rule.command';
import { ActivateDispatchRuleCommandHandler } from './activate/activate-dispatch-rule.command';
import { DeactivateDispatchRuleCommandHandler } from './deactivate/deactivate-dispatch-rule.command';
import {
  EligibleTargetResponse,
  EligibleTargetsQueryHandler,
} from './eligible-targets/eligible-targets.query';
import {
  ReorderDispatchRulesCommand,
  ReorderDispatchRulesCommandHandler,
} from './reorder/reorder-dispatch-rules.command';
import {
  SimulateDispatchRuleCommand,
  SimulateDispatchRuleCommandHandler,
  SimulateDispatchRuleResult,
} from '../simulate/simulate-dispatch-rule.command';
import {
  FindAuditByRuleQuery,
  FindAuditByRuleQueryHandler,
  FindAuditByRuleResponse,
} from '../audit/find-audit-by-rule.query';
import {
  RuleMetricsQuery,
  RuleMetricsQueryHandler,
  RuleMetricsResult,
} from '../metrics/rule-metrics.query';
import {
  GetRuleVersionsQueryHandler,
  RuleVersionSummary,
} from '../versions/get-rule-versions.query';
import { RestoreRuleVersionCommandHandler } from '../versions/restore-rule-version.command';

@Controller({ path: 'dispatch-rules', version: '1' })
@ApiTags('Dispatch Rules')
export class DispatchRulesController {
  constructor(
    private readonly _createHandler: CreateDispatchRuleCommandHandler,
    private readonly _updateHandler: UpdateDispatchRuleCommandHandler,
    private readonly _findAllHandler: FindAllDispatchRulesQueryHandler,
    private readonly _findByIdHandler: FindDispatchRuleByIdQueryHandler,
    private readonly _deleteHandler: DeleteDispatchRuleCommandHandler,
    private readonly _activateHandler: ActivateDispatchRuleCommandHandler,
    private readonly _deactivateHandler: DeactivateDispatchRuleCommandHandler,
    private readonly _eligibleTargetsHandler: EligibleTargetsQueryHandler,
    private readonly _reorderHandler: ReorderDispatchRulesCommandHandler,
    private readonly _simulateHandler: SimulateDispatchRuleCommandHandler,
    private readonly _auditHandler: FindAuditByRuleQueryHandler,
    private readonly _metricsHandler: RuleMetricsQueryHandler,
    private readonly _versionsHandler: GetRuleVersionsQueryHandler,
    private readonly _restoreVersionHandler: RestoreRuleVersionCommandHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() command: CreateDispatchRuleCommand
  ): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  // Static routes must come before parameterised :id routes
  @ApiResponse({
    type: EligibleTargetResponse,
    status: HttpStatus.OK,
    isArray: true,
    description: 'List of eligible targets',
  })
  @Get('eligible-targets')
  public async eligibleTargets(): Promise<EligibleTargetResponse[]> {
    return this._eligibleTargetsHandler.handlerAsync({});
  }

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    type: SimulateDispatchRuleResult,
  })
  public async simulate(
    @Body() command: SimulateDispatchRuleCommand
  ): Promise<SimulateDispatchRuleResult> {
    return this._simulateHandler.handlerAsync(command);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async reorder(
    @Body() command: ReorderDispatchRulesCommand
  ): Promise<void> {
    return this._reorderHandler.handlerAsync(command);
  }

  @Get()
  @ApiResponse({
    type: FindAllDispatchRulesQueryResponse,
    status: HttpStatus.OK,
    isArray: true,
    description: 'List of all dispatch rules',
  })
  public async findAll(
    @Query() query: FindAllDispatchRulesQuery
  ): Promise<FindAllDispatchRulesQueryResponse[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Find Dispatch Rule By Id',
    type: FindDispatchRuleByIdQueryResponse,
  })
  public async findById(
    @Param('id') id: string
  ): Promise<FindDispatchRuleByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdateDispatchRuleRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async activate(@Param('id') id: string): Promise<void> {
    return this._activateHandler.handlerAsync({ id });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deactivate(@Param('id') id: string): Promise<void> {
    return this._deactivateHandler.handlerAsync({ id });
  }

  @Get(':id/audit')
  public async audit(
    @Param('id') id: string,
    @Query() query: FindAuditByRuleQuery
  ): Promise<FindAuditByRuleResponse> {
    return this._auditHandler.handlerAsync({ ...query, id });
  }

  @Get(':id/metrics')
  public async metrics(
    @Param('id') id: string,
    @Query() query: RuleMetricsQuery
  ): Promise<RuleMetricsResult> {
    return this._metricsHandler.handlerAsync({ ...query, id });
  }

  @Get(':id/versions')
  public async versions(
    @Param('id') id: string
  ): Promise<RuleVersionSummary[]> {
    return this._versionsHandler.handlerAsync({ id });
  }

  @Post(':id/versions/:version/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async restoreVersion(
    @Param('id') id: string,
    @Param('version') version: string
  ): Promise<void> {
    return this._restoreVersionHandler.handlerAsync({
      id,
      version: Number(version),
    });
  }
}
