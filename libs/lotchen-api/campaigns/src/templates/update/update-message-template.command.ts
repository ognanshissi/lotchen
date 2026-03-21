import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel } from '../../common/campaign.enums';

export class UpdateMessageTemplateCommandRequest {
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
  subject?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  body?: string;

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

export class UpdateMessageTemplateCommand extends UpdateMessageTemplateCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdateMessageTemplateCommandHandler
  implements CommandHandler<UpdateMessageTemplateCommand, void>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: UpdateMessageTemplateCommand): Promise<void> {
    const template = await this.campaignsProvider.MessageTemplateModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    const $set: Record<string, any> = {
      updatedBy: this.campaignsProvider.user().userId,
      updatedByInfo: this.campaignsProvider.user(),
    };

    if (command.name !== undefined) $set['name'] = command.name;
    if (command.channel !== undefined) $set['channel'] = command.channel;
    if (command.subject !== undefined) $set['subject'] = command.subject;
    if (command.body !== undefined) $set['body'] = command.body;
    if (command.category !== undefined) $set['category'] = command.category;
    if (command.mergeFields !== undefined)
      $set['mergeFields'] = command.mergeFields;
    if (command.isWhatsAppApproved !== undefined)
      $set['isWhatsAppApproved'] = command.isWhatsAppApproved;
    if (command.whatsAppTemplateId !== undefined)
      $set['whatsAppTemplateId'] = command.whatsAppTemplateId;

    await this.campaignsProvider.MessageTemplateModel.findByIdAndUpdate(
      command.id,
      { $set }
    );
  }
}
