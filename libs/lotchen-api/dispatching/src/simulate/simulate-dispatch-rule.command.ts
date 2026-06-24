import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { DispatchingProvider } from '../dispatching.provider';
import { DispatchRuleStatus } from '../common/dispatch-rule.enums';

export class SimulateDispatchRuleCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  objectType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  fields?: Record<string, any>;
}

export interface SimulateDispatchRuleResult {
  matched: boolean;
  matchedRuleId?: string;
  matchedRuleName?: string;
  conditionPath: string[];
  assignedTarget?: { type: string; targetId: string; isFallback: boolean };
}

function evaluateCondition(
  condition: any,
  fields: Record<string, any>,
  path: string[]
): { matched: boolean; path: string[] } {
  // Leaf condition
  if ('field' in condition && 'operator' in condition) {
    const fieldValue = fields[condition.field];
    const condValue = condition.value;
    let matched = false;

    switch (condition.operator) {
      case 'eq':
        matched = String(fieldValue) === String(condValue);
        break;
      case 'neq':
        matched = String(fieldValue) !== String(condValue);
        break;
      case 'gt':
        matched = Number(fieldValue) > Number(condValue);
        break;
      case 'lt':
        matched = Number(fieldValue) < Number(condValue);
        break;
      case 'contains':
        matched = String(fieldValue ?? '')
          .toLowerCase()
          .includes(String(condValue).toLowerCase());
        break;
      case 'not_contains':
        matched = !String(fieldValue ?? '')
          .toLowerCase()
          .includes(String(condValue).toLowerCase());
        break;
      default:
        matched = false;
    }

    const label = `${condition.field} ${condition.operator} "${condValue}" → ${
      matched ? '✓' : '✗'
    }`;
    return { matched, path: [...path, label] };
  }

  // Condition group (AND / OR)
  if ('operator' in condition && 'conditions' in condition) {
    const isAnd = condition.operator === 'AND';
    const childResults: { matched: boolean; path: string[] }[] = [];

    for (const child of condition.conditions ?? []) {
      childResults.push(evaluateCondition(child, fields, []));
    }

    const groupMatched = isAnd
      ? childResults.every((r) => r.matched)
      : childResults.some((r) => r.matched);

    const childPaths = childResults.flatMap((r) => r.path);
    const groupLabel = `[${condition.operator}] → ${groupMatched ? '✓' : '✗'}`;

    return {
      matched: groupMatched,
      path: [...path, groupLabel, ...childPaths],
    };
  }

  return { matched: true, path: [...path, '(no conditions)'] };
}

@Injectable()
export class SimulateDispatchRuleCommandHandler
  implements
    CommandHandler<SimulateDispatchRuleCommand, SimulateDispatchRuleResult>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    command: SimulateDispatchRuleCommand
  ): Promise<SimulateDispatchRuleResult> {
    if (!command.objectType) {
      throw new BadRequestException('objectType is required for simulation');
    }

    const fields = command.fields ?? {};

    // Load active rules for this objectType in priority order
    const rules = await this.dispatchingProvider.DispatchRuleModel.find({
      objectType: command.objectType,
      status: DispatchRuleStatus.Active,
      deletedAt: null,
    })
      .sort({ priority: 1 })
      .lean();

    for (const rule of rules) {
      let conditionPath: string[] = [];
      let ruleMatched = true;

      if (rule.conditions && rule.conditions.conditions?.length > 0) {
        const result = evaluateCondition(rule.conditions, fields, []);
        ruleMatched = result.matched;
        conditionPath = result.path;
      } else {
        conditionPath = ['(pas de conditions — toujours vrai)'];
      }

      if (ruleMatched) {
        const primaryTarget =
          (rule.targets ?? []).find((t) => !t.isFallback) ??
          rule.targets?.[0] ??
          null;

        return {
          matched: true,
          matchedRuleId: String(rule._id),
          matchedRuleName: rule.name,
          conditionPath,
          assignedTarget: primaryTarget
            ? {
                type: primaryTarget.type,
                targetId: String(primaryTarget.targetId),
                isFallback: primaryTarget.isFallback,
              }
            : undefined,
        };
      }
    }

    return {
      matched: false,
      conditionPath: ['Aucune règle active ne correspond à ces champs'],
    };
  }
}
