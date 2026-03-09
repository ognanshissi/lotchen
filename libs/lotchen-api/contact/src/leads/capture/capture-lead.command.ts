import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeadProvider } from '../lead.provider';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';

export class CaptureLeadCommand {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  source!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  formData?: Record<string, string>;
}

@Injectable()
export class CaptureLeadCommandHandler
  implements CommandHandler<CaptureLeadCommand, void>
{
  private readonly _logger = new Logger(CaptureLeadCommandHandler.name);

  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: CaptureLeadCommand): Promise<void> {
    // Deduplicate: check if contact already exists
    const orFilters: any[] = [];
    if (command.email) orFilters.push({ email: command.email });
    if (command.mobileNumber)
      orFilters.push({ mobileNumber: command.mobileNumber });

    if (orFilters.length > 0) {
      const existing = await this.leadProvider.ContactModel.findOne({
        $or: orFilters,
        deletedAt: null,
      })
        .lean()
        .exec();

      if (existing) {
        // Update existing contact with additional info
        const $set: Record<string, any> = {};
        const $addToSet: Record<string, any> = {};

        if (command.formData) {
          for (const [key, value] of Object.entries(command.formData)) {
            $set[`customFields.capture_${key}`] = value;
          }
        }

        // Extract tags from formData
        const tags = this.extractTags(command.formData);
        if (tags.length > 0) {
          $addToSet.tags = { $each: tags };
        }

        const update: any = {};
        if (Object.keys($set).length > 0) update.$set = $set;
        if (Object.keys($addToSet).length > 0) update.$addToSet = $addToSet;

        if (Object.keys(update).length > 0) {
          await this.leadProvider.ContactModel.findByIdAndUpdate(
            existing._id,
            update
          );
        }

        return;
      }
    }

    // Create new lead
    const customFields: Record<string, string> = {};
    if (command.formData) {
      for (const [key, value] of Object.entries(command.formData)) {
        customFields[`capture_${key}`] = value;
      }
    }

    const tags = this.extractTags(command.formData);

    try {
      const lead = new this.leadProvider.ContactModel({
        firstName: command.firstName ?? '',
        lastName: command.lastName ?? '',
        email: command.email ?? '',
        mobileNumber: command.mobileNumber ?? '',
        source: command.source,
        type: ContactTypeEnum.Lead,
        status: ContactStatus.New,
        tags,
        customFields,
        statusHistory: [
          {
            previousStatus: ContactStatus.New,
            status: ContactStatus.New,
            changedAt: new Date(),
            changedBy: 'system',
          },
        ],
      });

      await lead.save();
    } catch (error) {
      this._logger.error('Error while capturing lead');
      throw error;
    }
  }

  private extractTags(formData?: Record<string, string>): string[] {
    if (!formData) return [];

    const tags = new Set<string>();
    for (const value of Object.values(formData)) {
      const parts = value
        .split(/[,\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 2);
      parts.forEach((p) => tags.add(p));
    }
    return Array.from(tags);
  }
}
