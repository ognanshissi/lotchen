import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { CallingProvider } from '../../calling.provider';

class TwilioConfigDto {
  @ApiPropertyOptional() accountSid?: string;
  @ApiPropertyOptional() apiKey?: string;
  @ApiPropertyOptional() apiSecret?: string;
  @ApiPropertyOptional() twimlAppSid?: string;
  @ApiPropertyOptional() callerId?: string;
}

class RingOverConfigDto {
  @ApiPropertyOptional() apiKey?: string;
  @ApiPropertyOptional() teamId?: string;
  @ApiPropertyOptional() webhookSecret?: string;
}

class AsteriskConfigDto {
  @ApiPropertyOptional() serverHost?: string;
  @ApiPropertyOptional() serverPort?: number;
  @ApiPropertyOptional() wsUrl?: string;
  @ApiPropertyOptional() sipDomain?: string;
  @ApiPropertyOptional() sipTrunkProvider?: string;
  @ApiPropertyOptional() stunServer?: string;
  @ApiPropertyOptional() turnServer?: string;
  @ApiPropertyOptional() turnUsername?: string;
  @ApiPropertyOptional() turnPassword?: string;
}

export class UpsertTelephonyConfigCommand {
  @ApiProperty({
    description: 'Telephony provider',
    enum: ['twilio', 'ringover', 'asterisk'],
  })
  @IsNotEmpty()
  provider!: string;

  @ApiPropertyOptional({ type: TwilioConfigDto })
  @IsOptional()
  twilioConfig?: TwilioConfigDto;

  @ApiPropertyOptional({ type: RingOverConfigDto })
  @IsOptional()
  ringoverConfig?: RingOverConfigDto;

  @ApiPropertyOptional({ type: AsteriskConfigDto })
  @IsOptional()
  asteriskConfig?: AsteriskConfigDto;

  @ApiPropertyOptional()
  @IsOptional()
  recordingEnabled?: boolean;

  @ApiPropertyOptional({
    enum: ['auto-announce', 'manual', 'disabled'],
  })
  @IsOptional()
  recordingConsent?: string;
}

@Injectable()
export class UpsertTelephonyConfigCommandHandler
  implements CommandHandler<UpsertTelephonyConfigCommand, any>
{
  constructor(private readonly _callingProvider: CallingProvider) {}

  public async handlerAsync(
    command: UpsertTelephonyConfigCommand
  ): Promise<any> {
    const user = this._callingProvider.user();

    const existing = await this._callingProvider.TelephonyConfigModel.findOne({
      isActive: true,
      deletedAt: null,
    });

    if (existing) {
      await this._callingProvider.TelephonyConfigModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            provider: command.provider,
            twilioConfig: command.twilioConfig ?? existing.twilioConfig,
            ringoverConfig: command.ringoverConfig ?? existing.ringoverConfig,
            asteriskConfig: command.asteriskConfig ?? existing.asteriskConfig,
            recordingEnabled:
              command.recordingEnabled ?? existing.recordingEnabled,
            recordingConsent:
              command.recordingConsent ?? existing.recordingConsent,
            updatedBy: user.userId,
            updatedByInfo: user,
          },
        }
      );
      return { id: existing._id };
    }

    const config = new this._callingProvider.TelephonyConfigModel({
      ...command,
      isActive: true,
      createdBy: user.userId,
      createdByInfo: user,
    });

    await config.save();
    return { id: config._id };
  }
}
