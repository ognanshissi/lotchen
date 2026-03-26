import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaptureConfigProvider } from '../capture-config.provider';
import {
  CaptureConfigPlatform,
  RoutingRuleType,
} from '../capture-config.schema';

class RoutingRuleDto {
  @ApiProperty({ enum: ['fixed', 'round-robin'] })
  @IsEnum(['fixed', 'round-robin'] as const)
  type!: RoutingRuleType;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignToUserId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignToTeamId?: string;
}

export class CreateCaptureConfigCommand {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    required: true,
    type: String,
    enum: ['website', 'linkedin', 'facebook', 'google-forms'],
  })
  @IsEnum(['website', 'linkedin', 'facebook', 'google-forms'] as const)
  platform!: CaptureConfigPlatform;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  fieldMapping?: Record<string, string>;

  @ApiPropertyOptional({ type: RoutingRuleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingRuleDto)
  routingRule?: RoutingRuleDto;
}

export class CreateCaptureConfigResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  apiKey!: string;
}

@Injectable()
export class CreateCaptureConfigCommandHandler
  implements
    CommandHandler<CreateCaptureConfigCommand, CreateCaptureConfigResponse>
{
  constructor(private readonly provider: CaptureConfigProvider) {}

  async handlerAsync(
    command: CreateCaptureConfigCommand
  ): Promise<CreateCaptureConfigResponse> {
    const existing = await this.provider.CaptureConfigModel.findOne({
      name: command.name,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (existing) {
      throw new BadRequestException(
        'Une configuration de capture avec ce nom existe déjà'
      );
    }

    const userId = this.provider.user()?.userId;

    const config = new this.provider.CaptureConfigModel({
      name: command.name,
      platform: command.platform,
      allowedDomains: command.allowedDomains ?? [],
      fieldMapping: command.fieldMapping ?? {},
      routingRule: command.routingRule ?? null,
      createdBy: userId,
      createdByInfo: this.provider.user(),
    });

    await config.save();

    return { id: config._id, apiKey: config.apiKey };
  }
}
