import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeadProvider } from '../lead.provider';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';
import { CaptureConfigDocument } from '../capture-config/capture-config.schema';

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

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  apiKey?: string;
}

@Injectable()
export class CaptureLeadCommandHandler
  implements CommandHandler<CaptureLeadCommand, void>
{
  private readonly _logger = new Logger(CaptureLeadCommandHandler.name);

  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: CaptureLeadCommand): Promise<void> {
    let config: CaptureConfigDocument | null = null;

    // Validate API key if provided
    if (command.apiKey) {
      config = await this.leadProvider.CaptureConfigModel.findOne({
        apiKey: command.apiKey,
        isActive: true,
        deletedAt: null,
      }).exec();

      if (!config) {
        throw new UnauthorizedException('Invalid or inactive API key');
      }

      // Apply field mapping
      if (config.fieldMapping && command.formData) {
        const mapped: Record<string, string> = {};
        const fieldMap =
          config.fieldMapping instanceof Map
            ? Object.fromEntries(config.fieldMapping)
            : (config.fieldMapping as Record<string, string>);

        for (const [key, value] of Object.entries(command.formData)) {
          const mappedKey = fieldMap[key] ?? key;
          mapped[mappedKey] = value;
        }
        command.formData = mapped;

        // Also remap top-level fields from formData
        if (mapped['firstName']) command.firstName = mapped['firstName'];
        if (mapped['lastName']) command.lastName = mapped['lastName'];
        if (mapped['email']) command.email = mapped['email'];
        if (mapped['mobileNumber'])
          command.mobileNumber = mapped['mobileNumber'];
      }
    }

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
        const $set: Record<string, any> = {};
        const $addToSet: Record<string, any> = {};

        if (command.formData) {
          for (const [key, value] of Object.entries(command.formData)) {
            $set[`customFields.capture_${key}`] = value;
          }
        }

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

    // Apply routing rule if config has one
    const routing = await this.resolveRouting(config);

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
        assignedToUserId: routing?.assignedToUserId,
        assignedToTeamId: routing?.assignedToTeamId,
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

  private async resolveRouting(config: CaptureConfigDocument | null): Promise<{
    assignedToUserId?: string;
    assignedToTeamId?: string;
  } | null> {
    if (!config?.routingRule) return null;

    const rule = config.routingRule;

    if (rule.type === 'fixed') {
      return {
        assignedToUserId: rule.assignToUserId ?? undefined,
        assignedToTeamId: rule.assignToTeamId ?? undefined,
      };
    }

    if (rule.type === 'round-robin' && rule.assignToTeamId) {
      const teamMembers = await this.leadProvider.UserModel.find({
        'teams._id': rule.assignToTeamId,
        deletedAt: null,
      })
        .lean()
        .exec();

      if (teamMembers.length === 0) return null;

      const nextIndex = (rule.lastAssignedIndex ?? 0) % teamMembers.length;
      const assignedUser = teamMembers[nextIndex];

      // Increment the round-robin counter
      await this.leadProvider.CaptureConfigModel.updateOne(
        { _id: config._id },
        { $set: { 'routingRule.lastAssignedIndex': nextIndex + 1 } }
      );

      return {
        assignedToUserId: assignedUser._id,
        assignedToTeamId: rule.assignToTeamId,
      };
    }

    return null;
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
