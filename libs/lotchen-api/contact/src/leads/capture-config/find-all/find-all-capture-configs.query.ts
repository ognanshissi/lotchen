import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CaptureConfigProvider } from '../capture-config.provider';
import { RoutingRuleType } from '../capture-config.schema';
import { IsEnum } from 'class-validator';

export class FindAllCaptureConfigsQuery {}

export enum CaptureConfigPlatformEnum {
  WEBSITE = 'website',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  GOOGLE_FORMS = 'google-forms',
}

class RoutingRuleResponse {
  @ApiProperty()
  type!: RoutingRuleType;

  @ApiPropertyOptional()
  assignToUserId?: string | null;

  @ApiPropertyOptional()
  assignToTeamId?: string | null;
}

export class CaptureConfigDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: CaptureConfigPlatformEnum,
    description: 'Platform of the capture config, e.g. LinkedIn, Email, etc.',
  })
  @IsEnum(CaptureConfigPlatformEnum)
  platform!: CaptureConfigPlatformEnum;

  @ApiProperty()
  apiKey!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: [String] })
  allowedDomains!: string[];

  @ApiPropertyOptional({ type: Object })
  fieldMapping?: Record<string, string>;

  @ApiPropertyOptional({ type: RoutingRuleResponse })
  routingRule?: RoutingRuleResponse | null;

  @ApiProperty()
  createdAt!: Date;
}

@Injectable()
export class FindAllCaptureConfigsQueryHandler
  implements QueryHandler<FindAllCaptureConfigsQuery, CaptureConfigDto[]>
{
  constructor(private readonly provider: CaptureConfigProvider) {}

  async handlerAsync(): Promise<CaptureConfigDto[]> {
    const configs = await this.provider.CaptureConfigModel.find({
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return configs.map((c) => ({
      id: c._id,
      name: c.name,
      platform: c.platform,
      apiKey: c.apiKey,
      isActive: c.isActive,
      allowedDomains: c.allowedDomains,
      fieldMapping: c.fieldMapping
        ? Object.fromEntries(
            c.fieldMapping instanceof Map
              ? c.fieldMapping
              : Object.entries(c.fieldMapping)
          )
        : {},
      routingRule: c.routingRule,
      createdAt: c.createdAt,
    }));
  }
}
