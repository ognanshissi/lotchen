import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { ContactProvider } from '../../contacts/contact.provider';

export class UpdateCallLogCommand {
  id!: string;

  @ApiPropertyOptional({ description: 'Call note' })
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Call disposition' })
  @IsOptional()
  disposition?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsOptional()
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Follow-up action' })
  @IsOptional()
  followUpAction?: string;

  @ApiPropertyOptional({ description: 'Recording URL' })
  @IsOptional()
  recordingUrl?: string;

  @ApiPropertyOptional({ description: 'Recording SID' })
  @IsOptional()
  recordingSid?: string;
}

@Injectable()
export class UpdateCallLogCommandHandler
  implements CommandHandler<UpdateCallLogCommand, void>
{
  constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(command: UpdateCallLogCommand): Promise<void> {
    const { id, ...fields } = command;

    const $set: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        $set[key] = value;
      }
    }

    if (Object.keys($set).length > 0) {
      await this._contactProvider.CallLogModel.updateOne({ _id: id }, { $set });
    }
  }
}
