import { CommandHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaptureConfigProvider } from '../capture-config.provider';
import { RoutingRuleType } from '../capture-config.schema';

class RoutingRuleDto {
  @IsEnum(['fixed', 'round-robin'] as const)
  type!: RoutingRuleType;

  @IsOptional()
  @IsString()
  assignToUserId?: string;

  @IsOptional()
  @IsString()
  assignToTeamId?: string;
}

export class UpdateCaptureConfigCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  fieldMapping?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingRuleDto)
  routingRule?: RoutingRuleDto;
}

export class UpdateCaptureConfigCommand extends UpdateCaptureConfigCommandRequest {
  id!: string;
}

@Injectable()
export class UpdateCaptureConfigCommandHandler
  implements CommandHandler<UpdateCaptureConfigCommand, void>
{
  constructor(private readonly provider: CaptureConfigProvider) {}

  async handlerAsync(command: UpdateCaptureConfigCommand): Promise<void> {
    const config = await this.provider.CaptureConfigModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!config) {
      throw new NotFoundException('Configuration de capture introuvable');
    }

    const userId = this.provider.user()?.userId;

    const updates: Record<string, any> = {
      updatedBy: userId,
      updatedByInfo: this.provider.user(),
    };

    if (command.name !== undefined) updates.name = command.name;
    if (command.isActive !== undefined) updates.isActive = command.isActive;
    if (command.allowedDomains !== undefined)
      updates.allowedDomains = command.allowedDomains;
    if (command.fieldMapping !== undefined)
      updates.fieldMapping = command.fieldMapping;
    if (command.routingRule !== undefined)
      updates.routingRule = command.routingRule;

    await this.provider.CaptureConfigModel.updateOne(
      { _id: command.id },
      { $set: updates }
    );
  }
}
