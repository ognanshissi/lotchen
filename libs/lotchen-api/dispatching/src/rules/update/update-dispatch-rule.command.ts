import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchingProvider } from '../../dispatching.provider';
import { DispatchObjectType } from '../../common/dispatch-rule.enums';
import {
  AssignmentTargetDto,
  AvailabilityConfigDto,
  CapacityRulesDto,
  EscalationRuleDto,
  RoutingStrategyDto,
} from '../create/create-dispatch-rule.command';

export class UpdateDispatchRuleRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DispatchObjectType })
  @IsOptional()
  @IsEnum(DispatchObjectType)
  objectType?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: any;

  @ApiPropertyOptional({ type: [AssignmentTargetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentTargetDto)
  targets?: AssignmentTargetDto[];

  @ApiPropertyOptional({ type: RoutingStrategyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingStrategyDto)
  routingStrategy?: RoutingStrategyDto;

  @ApiPropertyOptional({ type: CapacityRulesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CapacityRulesDto)
  capacityRules?: CapacityRulesDto;

  @ApiPropertyOptional({ type: AvailabilityConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvailabilityConfigDto)
  availabilityConfig?: AvailabilityConfigDto;

  @ApiPropertyOptional({ type: [EscalationRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EscalationRuleDto)
  escalationRules?: EscalationRuleDto[];
}

export class UpdateDispatchRuleCommand extends UpdateDispatchRuleRequest {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  id!: string;
}

@Injectable()
export class UpdateDispatchRuleCommandHandler
  implements CommandHandler<UpdateDispatchRuleCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: UpdateDispatchRuleCommand): Promise<void> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    // Snapshot current version before mutating
    const snapshot = {
      version: rule.version ?? 1,
      name: rule.name,
      description: rule.description,
      status: rule.status,
      objectType: rule.objectType,
      priority: rule.priority,
      conditions: rule.conditions,
      targets: rule.targets,
      routingStrategy: rule.routingStrategy,
      capacityRules: rule.capacityRules,
      availabilityConfig: rule.availabilityConfig,
      escalationRules: rule.escalationRules,
      snapshotAt: new Date().toISOString(),
    };

    const $set: Record<string, any> = {
      updatedBy: this.dispatchingProvider.user().userId,
      updatedByInfo: this.dispatchingProvider.user(),
      version: (rule.version ?? 1) + 1,
    };

    if (command.name !== undefined) $set['name'] = command.name;
    if (command.description !== undefined)
      $set['description'] = command.description;
    if (command.objectType !== undefined)
      $set['objectType'] = command.objectType;
    if (command.priority !== undefined) $set['priority'] = command.priority;
    if (command.conditions !== undefined)
      $set['conditions'] = command.conditions;
    if (command.targets !== undefined) $set['targets'] = command.targets;
    if (command.routingStrategy !== undefined)
      $set['routingStrategy'] = command.routingStrategy;
    if (command.capacityRules !== undefined)
      $set['capacityRules'] = command.capacityRules;
    if (command.availabilityConfig !== undefined)
      $set['availabilityConfig'] = command.availabilityConfig;
    if (command.escalationRules !== undefined)
      $set['escalationRules'] = command.escalationRules;

    await this.dispatchingProvider.DispatchRuleModel.findByIdAndUpdate(
      command.id,
      { $set, $push: { versionHistory: snapshot } }
    );
  }
}
