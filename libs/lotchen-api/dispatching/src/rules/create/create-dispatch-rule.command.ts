import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchingProvider } from '../../dispatching.provider';
import {
  AssignmentTargetType,
  DispatchObjectType,
  DispatchRuleStatus,
  RoutingMethod,
} from '../../common/dispatch-rule.enums';

export class AssignmentTargetDto {
  @ApiProperty({ enum: AssignmentTargetType })
  @IsEnum(AssignmentTargetType)
  type!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  targetId!: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isFallback?: boolean;
  // @ApiProperty({ type: String })
  // label!: string;
  // @ApiProperty({ type: String })
  // sublabel!: string;
}

export class RoutingStrategyDto {
  @ApiProperty({ enum: RoutingMethod })
  @IsEnum(RoutingMethod)
  method!: string;

  @ApiPropertyOptional()
  @IsOptional()
  params?: Record<string, any>;
}

export class CapacityRulesDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  maxOpenTickets?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  maxDailyAssignments?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  concurrentThreshold?: number;
}

export class AvailabilityConfigDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  respectBusinessHours?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  excludeOnLeave?: boolean;
}

export class EscalationRuleDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  trigger?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  delayMinutes?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  notifyOnEscalation?: boolean;
}

export class CreateDispatchRuleCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DispatchObjectType })
  @IsEnum(DispatchObjectType)
  objectType!: string;

  @ApiPropertyOptional({ enum: DispatchRuleStatus })
  @IsOptional()
  @IsEnum(DispatchRuleStatus)
  status?: string;

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

@Injectable()
export class CreateDispatchRuleCommandHandler
  implements CommandHandler<CreateDispatchRuleCommand, any>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: CreateDispatchRuleCommand): Promise<any> {
    const user = this.dispatchingProvider.user();
    const doc = new this.dispatchingProvider.DispatchRuleModel({
      name: command.name,
      description: command.description ?? '',
      objectType: command.objectType,
      status: command.status ?? 'draft',
      priority: command.priority ?? 0,
      conditions: command.conditions ?? null,
      targets: command.targets ?? [],
      routingStrategy: command.routingStrategy ?? null,
      capacityRules: command.capacityRules ?? null,
      availabilityConfig: command.availabilityConfig ?? null,
      escalationRules: command.escalationRules ?? [],
      createdBy: user.userId,
      createdByInfo: user,
    });

    const errors = doc.validateSync();
    if (errors) {
      throw new BadRequestException(errors.message);
    }

    const saved = await doc.save();
    return saved.toObject();
  }
}
