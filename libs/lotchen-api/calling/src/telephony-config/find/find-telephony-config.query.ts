import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { CallingProvider } from '../../calling.provider';

export class FindTelephonyConfigQuery {}

export class FindTelephonyConfigResponse {
  @ApiProperty() id!: string;
  @ApiProperty() provider!: string;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional() twilioConfig?: any;
  @ApiPropertyOptional() ringoverConfig?: any;
  @ApiPropertyOptional() asteriskConfig?: any;
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
