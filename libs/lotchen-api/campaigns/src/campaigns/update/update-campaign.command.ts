import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel } from '../../common/campaign.enums';
import { AudienceFilterDto } from '../create/create-campaign.command';

export class UpdateCampaignCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: CampaignChannel })
  @IsOptional()
  @IsEnum(CampaignChannel)
  channel?: CampaignChannel;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: [AudienceFilterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AudienceFilterDto)
  audienceFilters?: AudienceFilterDto[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignCommand extends UpdateCampaignCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdateCampaignCommandHandler
  implements CommandHandler<UpdateCampaignCommand, void>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: UpdateCampaignCommand): Promise<void> {
    const campaign = await this.campaignsProvider.CampaignModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const $set: Record<string, any> = {
      updatedBy: this.campaignsProvider.user().userId,
      updatedByInfo: this.campaignsProvider.user(),
    };

    if (command.name !== undefined) $set['name'] = command.name;
    if (command.channel !== undefined) $set['channel'] = command.channel;
    if (command.templateId !== undefined)
      $set['templateId'] = command.templateId;
    if (command.subject !== undefined) $set['subject'] = command.subject;
    if (command.body !== undefined) $set['body'] = command.body;
    if (command.audienceFilters !== undefined)
      $set['audienceFilters'] = command.audienceFilters;
    if (command.scheduledAt !== undefined)
      $set['scheduledAt'] = command.scheduledAt
        ? new Date(command.scheduledAt)
        : null;

    await this.campaignsProvider.CampaignModel.findByIdAndUpdate(command.id, {
      $set,
    });
  }
}
