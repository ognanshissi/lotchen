import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeadProvider } from '../lead.provider';
import { ContactTypeEnum, contactSource } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';

const VALID_SOURCES: contactSource[] = [
  'Website',
  'Referral',
  'Social Media',
  'Event',
  'Cold Call',
  'Email',
  'Back Office',
  'LinkedIn',
  'Facebook',
  'Twitter',
  'Google',
  'Instagram',
  'YouTube',
  'Pinterest',
  'Snapchat',
  'TikTok',
  'Reddit',
  'Quora',
  'Yelp',
  'Campaign',
  'Other',
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export class CreateLeadCommand {
  @ApiProperty({ required: true, type: String })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  mobileNumber!: string;

  @ApiProperty({
    required: true,
    type: String,
    enum: VALID_SOURCES,
  })
  @IsIn(VALID_SOURCES)
  source!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  productInterest?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional({ type: String, enum: VALID_PRIORITIES })
  @IsOptional()
  @IsIn(VALID_PRIORITIES)
  priority?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateLeadCommandResponse {
  @ApiProperty({ required: true })
  id!: string;
}

@Injectable()
export class CreateLeadCommandHandler
  implements CommandHandler<CreateLeadCommand, CreateLeadCommandResponse>
{
  private readonly _logger = new Logger(CreateLeadCommandHandler.name);

  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(
    command: CreateLeadCommand
  ): Promise<CreateLeadCommandResponse> {
    const existingContact = await this.leadProvider.ContactModel.findOne({
      $or: [{ mobileNumber: command.mobileNumber }, { email: command.email }],
      deletedAt: null,
    })
      .lean()
      .exec();

    if (existingContact) {
      throw new BadRequestException(
        'Un contact avec cet email ou numéro de téléphone existe déjà'
      );
    }

    const userId = this.leadProvider.user()?.userId;

    let assignedToTeamId: string | undefined;
    let territoryId: string | undefined;

    if (userId) {
      const creator = await this.leadProvider.UserModel.findById(userId)
        .lean()
        .exec();
      if (creator?.teams?.length) {
        assignedToTeamId = (creator.teams[0] as any)._id?.toString();
        territoryId = (creator.teams[0] as any).territoryId?.toString();
      }
    }

    // Compute initial lead score from profile completeness
    let leadScore = 0;
    if (command.email) leadScore += 10;
    if (command.mobileNumber) leadScore += 10;
    if (command.source) leadScore += 5;
    if (command.productInterest) leadScore += 15;
    if (command.estimatedValue) leadScore += 10;

    const customFields: Record<string, string> = {};
    if (command.productInterest)
      customFields['productInterest'] = command.productInterest;
    if (command.estimatedValue !== undefined)
      customFields['estimatedValue'] = String(command.estimatedValue);
    if (command.priority) customFields['priority'] = command.priority;
    if (command.notes) customFields['notes'] = command.notes;

    try {
      const lead = new this.leadProvider.ContactModel({
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
        mobileNumber: command.mobileNumber,
        source: command.source,
        type: ContactTypeEnum.Lead,
        status: ContactStatus.New,
        createdBy: userId,
        createdByInfo: this.leadProvider.user(),
        assignedToUserId: userId,
        creditScore: leadScore,
        assignedToTeamId,
        territoryId,
        tags: command.tags ?? [],
        customFields,
        statusHistory: [
          {
            previousStatus: ContactStatus.New,
            status: ContactStatus.New,
            changedAt: new Date(),
            changedBy: userId,
          },
        ],
      });

      lead.validateSync();
      await lead.save();

      return { id: lead._id };
    } catch (error) {
      this._logger.error('Error while creating lead');
      throw new BadRequestException('Error while creating lead');
    }
  }
}
