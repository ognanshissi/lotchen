export * from './create/create-dispatch-rule.command';
export * from './update/update-dispatch-rule.command';
export * from './find-all/find-all-dispatch-rules.query';
export * from './find-by-id/find-dispatch-rule-by-id.query';
export * from './delete/delete-dispatch-rule.command';
export * from './activate/activate-dispatch-rule.command';
export * from './deactivate/deactivate-dispatch-rule.command';
export * from './eligible-targets/eligible-targets.query';
export * from './reorder/reorder-dispatch-rules.command';
export * from './dispatch-rules.controller';
export * from '../simulate/simulate-dispatch-rule.command';
export * from '../audit/find-audit-by-rule.query';
export * from '../metrics/rule-metrics.query';
export * from '../versions/get-rule-versions.query';
export * from '../versions/restore-rule-version.command';

import { CreateDispatchRuleCommandHandler } from './create/create-dispatch-rule.command';
import { UpdateDispatchRuleCommandHandler } from './update/update-dispatch-rule.command';
import { FindAllDispatchRulesQueryHandler } from './find-all/find-all-dispatch-rules.query';
import { FindDispatchRuleByIdQueryHandler } from './find-by-id/find-dispatch-rule-by-id.query';
import { DeleteDispatchRuleCommandHandler } from './delete/delete-dispatch-rule.command';
import { ActivateDispatchRuleCommandHandler } from './activate/activate-dispatch-rule.command';
import { DeactivateDispatchRuleCommandHandler } from './deactivate/deactivate-dispatch-rule.command';
import { EligibleTargetsQueryHandler } from './eligible-targets/eligible-targets.query';
import { ReorderDispatchRulesCommandHandler } from './reorder/reorder-dispatch-rules.command';
import { SimulateDispatchRuleCommandHandler } from '../simulate/simulate-dispatch-rule.command';
import { FindAuditByRuleQueryHandler } from '../audit/find-audit-by-rule.query';
import { RuleMetricsQueryHandler } from '../metrics/rule-metrics.query';
import { GetRuleVersionsQueryHandler } from '../versions/get-rule-versions.query';
import { RestoreRuleVersionCommandHandler } from '../versions/restore-rule-version.command';

export const dispatchRulesHandlers = [
  CreateDispatchRuleCommandHandler,
  UpdateDispatchRuleCommandHandler,
  FindAllDispatchRulesQueryHandler,
  FindDispatchRuleByIdQueryHandler,
  DeleteDispatchRuleCommandHandler,
  ActivateDispatchRuleCommandHandler,
  DeactivateDispatchRuleCommandHandler,
  EligibleTargetsQueryHandler,
  ReorderDispatchRulesCommandHandler,
  SimulateDispatchRuleCommandHandler,
  FindAuditByRuleQueryHandler,
  RuleMetricsQueryHandler,
  GetRuleVersionsQueryHandler,
  RestoreRuleVersionCommandHandler,
];
