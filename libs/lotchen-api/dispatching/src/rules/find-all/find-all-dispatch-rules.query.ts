import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
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
import { Type } from 'class-transformer';

export class FindAllDispatchRulesQuery {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  objectType?: string;
}

export class FindAllDispatchRulesQueryResponse {
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
  status!: string;

  @ApiProperty({ enum: DispatchObjectType })
  objectType!: string;

  @ApiProperty({ type: Number })
  priority!: number;

  @ApiPropertyOptional({ type: ConditionDto })
  @Type(() => ConditionDto)
  conditions?: ConditionDto;

  @ApiProperty({ type: [AssignmentTargetDto] })
  @IsArray()
  @Type(() => AssignmentTargetDto)
  targets!: AssignmentTargetDto[];

  @ApiPropertyOptional({ type: RoutingStrategyDto })
  @Type(() => RoutingStrategyDto)
  routingStrategy?: RoutingStrategyDto;

  @ApiPropertyOptional({ type: CapacityRulesDto })
  @Type(() => CapacityRulesDto)
  capacityRules?: CapacityRulesDto;

  @ApiPropertyOptional({ type: AvailabilityConfigDto })
  @Type(() => AvailabilityConfigDto)
  availabilityConfig?: AvailabilityConfigDto;

  @ApiProperty({ type: [EscalationRuleDto] })
  @Type(() => EscalationRuleDto)
  @IsArray()
  escalationRules!: EscalationRuleDto[];

  @ApiProperty({ type: Number })
  version!: number;

  @ApiPropertyOptional({ type: [Object] })
  versionHistory!: any[];

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

@Injectable()
export class FindAllDispatchRulesQueryHandler
  implements
    QueryHandler<
      FindAllDispatchRulesQuery,
      FindAllDispatchRulesQueryResponse[]
    >
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    query: FindAllDispatchRulesQuery
  ): Promise<FindAllDispatchRulesQueryResponse[]> {
    const filter: Record<string, any> = { deletedAt: null };

    if (query.status) filter['status'] = query.status;
    if (query.objectType) filter['objectType'] = query.objectType;

    return this.dispatchingProvider.DispatchRuleModel.find(filter)
      .sort({ priority: 1, updatedAt: -1 })
      .lean();
  }
}
