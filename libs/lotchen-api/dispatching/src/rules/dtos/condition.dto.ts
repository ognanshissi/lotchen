import { LogicalOperator } from '../../common/dispatch-rule.enums';

export class ConditionDto {
  operator: LogicalOperator;
  conditions: ConditionLineDto[];
}

export class ConditionLineDto {
  field: string;
  operator: LogicalOperator;
  value: string | string[];
}
