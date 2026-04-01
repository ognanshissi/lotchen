import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export class UpdateLeadCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsEmail()
  email?: string;

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
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  source?: string;

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

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateLeadCommand extends UpdateLeadCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdateLeadCommandHandler
  implements CommandHandler<UpdateLeadCommand, void>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: UpdateLeadCommand): Promise<void> {
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

    const dupeFilters = [];
    if (command.email) dupeFilters.push({ email: command.email });
    if (command.mobileNumber)
      dupeFilters.push({ mobileNumber: command.mobileNumber });

    if (dupeFilters.length > 0) {
      const isDuplicated = await this.leadProvider.ContactModel.findOne(
        { $or: dupeFilters },
        '_id'
      )
        .lean()
        .exec();

      if (isDuplicated && isDuplicated._id.toString() !== lead._id.toString()) {
        throw new BadRequestException(
          'Un contact avec cet email ou numéro de téléphone existe déjà'
        );
      }
    }

    const $set: Record<string, any> = {
      updatedBy: this.leadProvider.user().userId,
      updatedByInfo: this.leadProvider.user(),
    };

    if (command.firstName !== undefined) $set.firstName = command.firstName;
    if (command.lastName !== undefined) $set.lastName = command.lastName;
    if (command.email !== undefined) $set.email = command.email;
    if (command.mobileNumber !== undefined)
      $set.mobileNumber = command.mobileNumber;
    if (command.source !== undefined) $set.source = command.source;
    if (command.tags !== undefined) $set.tags = command.tags;

    if (command.productInterest !== undefined)
      $set['customFields.productInterest'] = command.productInterest;
    if (command.estimatedValue !== undefined)
      $set['customFields.estimatedValue'] = String(command.estimatedValue);
    if (command.priority !== undefined)
      $set['customFields.priority'] = command.priority;
    if (command.notes !== undefined) $set['customFields.notes'] = command.notes;

    if (command.customFields !== undefined) {
      for (const [key, value] of Object.entries(command['customFields'])) {
        $set[`customFields.${key}`] = value;
      }
    }

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set,
    });
  }
}
