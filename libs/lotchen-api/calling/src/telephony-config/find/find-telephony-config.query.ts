import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { CallingProvider } from '../../calling.provider';

export class FindTelephonyConfigQuery {}

export class TwilioConfigDto {
  @ApiProperty() accountSid!: string;
  @ApiProperty() apiSecret!: string;
  @ApiProperty() twimlAppSid!: string;
  @ApiProperty() apiKey!: string;
  @ApiProperty() callerId!: string;
}

export class RingoverConfigDto {
  @ApiProperty() apiKey!: string;
  @ApiProperty() teamId!: string;
  @ApiProperty() webhookSecret!: string;
}

export class AsteriskConfigDto {
  @ApiProperty() serverHost!: string;
  @ApiProperty() stunServer!: string;
  @ApiProperty() sipDomain!: string;
  @ApiProperty() wsUrl!: string;
  @ApiProperty() serverPort!: number;
  @ApiProperty() turnServer!: string;
  @ApiProperty() turnUsername!: string;
  @ApiProperty() turnPassword!: string;
  @ApiProperty() sipTrunkProvider!: string;
}

export class FindTelephonyConfigResponse {
  @ApiProperty() id!: string;
  @ApiProperty() provider!: string;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({
    description: 'Twilio configuration details, if provider is Twilio',
  })
  twilioConfig?: TwilioConfigDto | null;
  @ApiPropertyOptional({
    type: RingoverConfigDto,
    description: 'RingOver configuration details, if provider is RingOver',
  })
  ringoverConfig?: RingoverConfigDto | null;
  @ApiPropertyOptional({
    type: AsteriskConfigDto,
    description: 'Asterisk configuration details, if provider is Asterisk',
  })
  asteriskConfig?: AsteriskConfigDto | null;
  @ApiProperty() recordingEnabled!: boolean;
  @ApiProperty() recordingConsent!: string;
}

@Injectable()
export class FindTelephonyConfigQueryHandler
  implements
    QueryHandler<FindTelephonyConfigQuery, FindTelephonyConfigResponse | null>
{
  constructor(private readonly _callingProvider: CallingProvider) {}

  public async handlerAsync(): Promise<FindTelephonyConfigResponse | null> {
    const config = await this._callingProvider.TelephonyConfigModel.findOne({
      isActive: true,
      deletedAt: null,
    }).lean();

    if (!config) return null;

    return {
      id: config._id,
      provider: config.provider,
      isActive: config.isActive,
      twilioConfig: config.twilioConfig ?? null,
      ringoverConfig: config.ringoverConfig ?? null,
      asteriskConfig: config.asteriskConfig ?? null,
      recordingEnabled: config.recordingEnabled,
      recordingConsent: config.recordingConsent,
    };
  }
}
