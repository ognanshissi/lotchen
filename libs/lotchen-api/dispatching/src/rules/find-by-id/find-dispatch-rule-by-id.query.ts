import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchingProvider } from '../../dispatching.provider';
import {
  DispatchObjectType,
  DispatchRuleStatus,
} from '../../common/dispatch-rule.enums';
import {
  AssignmentTargetDto,
  AvailabilityConfigDto,
  CapacityRulesDto,
  EscalationRuleDto,
  RoutingStrategyDto,
} from '../create/create-dispatch-rule.command';
import { ConditionDto } from '../dtos/condition.dto';
import { IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FindDispatchRuleByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

export class FindDispatchRuleByIdQueryResponse {
  @ApiProperty({ description: 'Dispatch Id' })
  _id!: string;
  @ApiProperty({ description: 'Name' })
  name!: string;

  @ApiProperty({ description: 'Description' })
  description!: string;

  @ApiProperty({
    type: String,
    enum: DispatchRuleStatus,
    description: DispatchRuleStatus.Draft,
  })
  @IsEnum(DispatchRuleStatus)
  status!: string;

  @ApiProperty({ enum: DispatchObjectType })
  objectType!: string;

  @ApiProperty({ type: Number })
  priority!: number;

  @ApiPropertyOptional({ type: ConditionDto })
  conditions?: ConditionDto;

  @ApiProperty({ type: [AssignmentTargetDto] })
  targets!: AssignmentTargetDto[];

  @ApiPropertyOptional({ type: RoutingStrategyDto })
  routingStrategy?: RoutingStrategyDto;

  @ApiPropertyOptional({ type: CapacityRulesDto })
  capacityRules?: CapacityRulesDto;

  @ApiPropertyOptional({ type: AvailabilityConfigDto })
  availabilityConfig?: AvailabilityConfigDto;

  @ApiProperty({ type: [EscalationRuleDto] })
  @IsArray()
  @Type(() => EscalationRuleDto)
  escalationRules!: EscalationRuleDto[];

  @ApiProperty({ type: Number })
  version!: number;

  @ApiPropertyOptional({ type: [Object] })
  versionHistory!: any[];
}

@Injectable()
export class FindDispatchRuleByIdQueryHandler
  implements
    QueryHandler<FindDispatchRuleByIdQuery, FindDispatchRuleByIdQueryResponse>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    query: FindDispatchRuleByIdQuery
  ): Promise<FindDispatchRuleByIdQueryResponse> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }
    return rule;
  }
}
