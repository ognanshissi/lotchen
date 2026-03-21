import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel } from '../../common/campaign.enums';

export class CreateMessageTemplateCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: CampaignChannel })
  @IsNotEmpty()
  @IsEnum(CampaignChannel)
  channel!: CampaignChannel;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  body!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  mergeFields?: string[];

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isWhatsAppApproved?: boolean;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  whatsAppTemplateId?: string;
}

export class CreateMessageTemplateResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  name!: string;
}

@Injectable()
export class CreateMessageTemplateCommandHandler
  implements CommandHandler<CreateMessageTemplateCommand, any>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: CreateMessageTemplateCommand): Promise<any> {
    const user = this.campaignsProvider.user();

    const doc = new this.campaignsProvider.MessageTemplateModel({
      name: command.name,
      channel: command.channel,
      subject: command.subject,
      body: command.body,
      category: command.category,
      mergeFields: command.mergeFields || [],
      isWhatsAppApproved: command.isWhatsAppApproved,
      whatsAppTemplateId: command.whatsAppTemplateId,
      createdBy: user.userId,
      createdByInfo: user,
    });

    const saved = await doc.save();
    return saved.toObject();
  }
}
