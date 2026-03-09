import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { IsArray, IsOptional, IsString } from 'class-validator';

const STOP_WORDS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'de',
  'du',
  'et',
  'ou',
  'en',
  'a',
  'au',
  'the',
  'is',
  'are',
  'and',
  'or',
  'to',
  'for',
  'in',
  'on',
  'it',
  'of',
  'at',
  'by',
]);

export class EnrichLeadCommandRequest {
  @ApiPropertyOptional({ type: String, description: 'Free text comments' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Interest categories (Banking, Insurance, Loan, etc.)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestCategories?: string[];
}

export class EnrichLeadCommand extends EnrichLeadCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class EnrichLeadCommandHandler
  implements CommandHandler<EnrichLeadCommand, void>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: EnrichLeadCommand): Promise<void> {
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

    const existingTags = new Set<string>(lead.tags ?? []);

    // Extract keywords from comments
    if (command.comments) {
      const keywords = command.comments
        .split(/[\s,.;:!?()]+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
      keywords.forEach((k) => existingTags.add(k));
    }

    // Add interest categories
    if (command.interestCategories) {
      command.interestCategories.forEach((c) =>
        existingTags.add(c.toLowerCase())
      );
    }

    const $set: Record<string, any> = {
      tags: Array.from(existingTags),
      updatedBy: this.leadProvider.user().userId,
      updatedByInfo: this.leadProvider.user(),
    };

    if (command.comments) {
      $set['customFields.enrichmentComments'] = command.comments;
    }

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set,
    });
  }
}
