import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';

export class UpdateDealCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedToName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateDealCommand extends UpdateDealCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdateDealCommandHandler
  implements CommandHandler<UpdateDealCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: UpdateDealCommand): Promise<void> {
    const deal = await this.pipelinesProvider.DealModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const $set: Record<string, any> = {
      updatedBy: this.pipelinesProvider.user().userId,
      updatedByInfo: this.pipelinesProvider.user(),
    };

    if (command.title !== undefined) $set['title'] = command.title;
    if (command.amount !== undefined) $set['amount'] = command.amount;
    if (command.contactId !== undefined) $set['contactId'] = command.contactId;
    if (command.contactName !== undefined)
      $set['contactName'] = command.contactName;
    if (command.assignedTo !== undefined)
      $set['assignedTo'] = command.assignedTo;
    if (command.assignedToName !== undefined)
      $set['assignedToName'] = command.assignedToName;
    if (command.expectedCloseDate !== undefined)
      $set['expectedCloseDate'] = new Date(command.expectedCloseDate);
    if (command.notes !== undefined) $set['notes'] = command.notes;
    if (command.tags !== undefined) $set['tags'] = command.tags;

    await this.pipelinesProvider.DealModel.findByIdAndUpdate(command.id, {
      $set,
    });
  }
}
