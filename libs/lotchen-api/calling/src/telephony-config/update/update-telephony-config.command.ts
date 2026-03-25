import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { CallingProvider } from '../../calling.provider';

export class UpdateTelephonyConfigCommand {
  id!: string;

  @ApiPropertyOptional() @IsOptional() provider?: string;
  @ApiPropertyOptional() @IsOptional() twilioConfig?: any;
  @ApiPropertyOptional() @IsOptional() ringoverConfig?: any;
  @ApiPropertyOptional() @IsOptional() asteriskConfig?: any;
  @ApiPropertyOptional() @IsOptional() recordingEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() recordingConsent?: string;
}

@Injectable()
export class UpdateTelephonyConfigCommandHandler
  implements CommandHandler<UpdateTelephonyConfigCommand, void>
{
  constructor(private readonly _callingProvider: CallingProvider) {}

  public async handlerAsync(
    command: UpdateTelephonyConfigCommand
  ): Promise<void> {
    const user = this._callingProvider.user();
    const { id, ...updateFields } = command;

    const $set: Record<string, any> = {
      updatedBy: user.userId,
      updatedByInfo: user,
    };

    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined) {
        $set[key] = value;
      }
    }

    await this._callingProvider.TelephonyConfigModel.updateOne(
      { _id: id },
      { $set }
    );
  }
}
