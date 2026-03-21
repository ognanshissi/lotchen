import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel } from '../../common/campaign.enums';

export class AudienceFilterDto {
  @ApiProperty({
    type: String,
    description: 'Field name to filter on, e.g. "country", "age", "tags"',
  })
  @IsNotEmpty()
  @IsString()
  field!: string;

  @ApiProperty({
    type: String,
    description: 'Supported operators: eq, in, contains',
  })
  @IsNotEmpty()
  @IsString()
  operator!: string;

  @ApiProperty({
    description:
      'Value can be string, number, boolean or array depending on operator',
  })
  @IsNotEmpty()
  value!: any;
}

export class CreateCampaignCommand {
  @ApiProperty({ type: String, description: 'Name of the campaign' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    enum: CampaignChannel,
    description: 'Channel to send the campaign, e.g. Email, SMS, Push',
  })
  @IsNotEmpty()
  @IsEnum(CampaignChannel)
  channel!: CampaignChannel;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional message template ID to use for this campaign',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional subject for the campaign (used for email)',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional body for the campaign',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    type: [AudienceFilterDto],
    description: 'Optional filters for the campaign audience',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudienceFilterDto)
  audienceFilters?: AudienceFilterDto[];

  @ApiPropertyOptional({
    type: String,
    description: 'Optional date and time to schedule the campaign',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

@Injectable()
export class CreateCampaignCommandHandler
  implements CommandHandler<CreateCampaignCommand, any>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: CreateCampaignCommand): Promise<any> {
    const user = this.campaignsProvider.user();

    const doc = new this.campaignsProvider.CampaignModel({
      name: command.name,
      channel: command.channel,
      templateId: command.templateId,
      subject: command.subject,
      body: command.body,
      audienceFilters: command.audienceFilters || [],
      scheduledAt: command.scheduledAt
        ? new Date(command.scheduledAt)
        : undefined,
      createdBy: user.userId,
      createdByInfo: user,
    });

    const saved = await doc.save();
    return saved.toObject();
  }
}
