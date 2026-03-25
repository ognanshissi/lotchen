import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandHandler } from '@lotchen/api/core';
import { CallingProvider } from '../calling.provider';

export class GenerateCallerTokenCommand {}

export class CallerTokenResponse {
  @ApiProperty() token!: string;
  @ApiProperty() identity!: string;
  @ApiProperty() provider!: string;
  @ApiPropertyOptional() wsUrl?: string;
  @ApiPropertyOptional() sipDomain?: string;
  @ApiPropertyOptional() stunServer?: string;
  @ApiPropertyOptional() turnServer?: string;
  @ApiPropertyOptional() turnUsername?: string;
  @ApiPropertyOptional() turnPassword?: string;
  @ApiPropertyOptional() recordingEnabled?: boolean;
}

@Injectable()
export class GenerateCallerTokenCommandHandler
  implements CommandHandler<GenerateCallerTokenCommand, CallerTokenResponse>
{
  constructor(private readonly _callingProvider: CallingProvider) {}

  public async handlerAsync(): Promise<CallerTokenResponse> {
    const user = this._callingProvider.user();
    const identity = `${user.firstName}${user.lastName}`.trim();

    const config = await this._callingProvider.TelephonyConfigModel.findOne({
      isActive: true,
      deletedAt: null,
    }).lean();

    if (config?.provider === 'twilio' && config.twilioConfig) {
      const twilio = config.twilioConfig;
      const token = this._generateTwilioToken(
        twilio.accountSid,
        twilio.apiKey,
        twilio.apiSecret,
        twilio.twimlAppSid,
        identity
      );
      return {
        token,
        identity,
        provider: 'twilio',
        recordingEnabled: config.recordingEnabled,
      };
    }

    if (config?.provider === 'ringover' && config.ringoverConfig) {
      return {
        token: config.ringoverConfig.apiKey,
        identity,
        provider: 'ringover',
        recordingEnabled: config.recordingEnabled,
      };
    }

    if (config?.provider === 'asterisk' && config.asteriskConfig) {
      const ast = config.asteriskConfig;
      return {
        token: '',
        identity,
        provider: 'asterisk',
        wsUrl: ast.wsUrl,
        sipDomain: ast.sipDomain,
        stunServer: ast.stunServer,
        turnServer: ast.turnServer,
        turnUsername: ast.turnUsername,
        turnPassword: ast.turnPassword,
        recordingEnabled: config.recordingEnabled,
      };
    }

    // Fallback: env vars (backward compat)
    return this._generateTokenFromEnv(identity);
  }

  private _generateTwilioToken(
    accountSid: string,
    apiKey: string,
    apiSecret: string,
    twimlAppSid: string,
    identity: string
  ): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AccessToken = require('twilio').jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
    });
    const grant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);
    return accessToken.toJwt();
  }

  private _generateTokenFromEnv(identity: string): CallerTokenResponse {
    const token = this._generateTwilioToken(
      process.env['TWILIO_ACCOUNT_SID'] ?? '',
      process.env['TWILIO_API_KEY'] ?? '',
      process.env['TWILIO_API_SECRET'] ?? '',
      process.env['TWILIO_TWIML_APP_SID'] ?? '',
      identity
    );
    return { token, identity, provider: 'twilio' };
  }
}
