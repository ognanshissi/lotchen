import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';
import { IsOptional, IsString } from 'class-validator';

export class QualifyLeadCommandRequest {
  @ApiPropertyOptional({ type: String, description: 'Budget info (BANT)' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Decision-maker info (BANT)',
  })
  @IsOptional()
  @IsString()
  authority?: string;

  @ApiPropertyOptional({ type: String, description: 'Need description (BANT)' })
  @IsOptional()
  @IsString()
  need?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Expected timeline (BANT)',
  })
  @IsOptional()
  @IsString()
  timeline?: string;
}

export class QualifyLeadCommand extends QualifyLeadCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class QualifyLeadCommandHandler
  implements CommandHandler<QualifyLeadCommand, void>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: QualifyLeadCommand): Promise<void> {
    const lead = await this.leadProvider.ContactModel.findOne({
      _id: command.id,
      type: ContactTypeEnum.Lead,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const previousStatus = lead.status;
    const $set: Record<string, any> = {
      status: ContactStatus.Qualified,
      updatedBy: this.leadProvider.user().userId,
      updatedByInfo: this.leadProvider.user(),
    };

    if (command.budget) $set['customFields.bant_budget'] = command.budget;
    if (command.authority)
      $set['customFields.bant_authority'] = command.authority;
    if (command.need) $set['customFields.bant_need'] = command.need;
    if (command.timeline) $set['customFields.bant_timeline'] = command.timeline;

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set,
      $push: {
        statusHistory: {
          previousStatus,
          status: ContactStatus.Qualified,
          changedAt: new Date(),
          changedBy: this.leadProvider.user().userId,
        },
      },
    });
  }
}
