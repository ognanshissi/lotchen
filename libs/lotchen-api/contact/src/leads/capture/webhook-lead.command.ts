import { CommandHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CaptureLeadCommandHandler } from './capture-lead.command';

const VALID_PLATFORMS = [
  'google-forms',
  'linkedin',
  'facebook',
  'website',
] as const;

type WebhookPlatform = (typeof VALID_PLATFORMS)[number];

export class WebhookLeadCommandRequest {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  payload?: Record<string, any>;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  apiKey?: string;
}

export class WebhookLeadCommand extends WebhookLeadCommandRequest {
  @ApiProperty({
    required: true,
    type: String,
    enum: VALID_PLATFORMS,
  })
  @IsIn(VALID_PLATFORMS)
  platform!: WebhookPlatform;
}

@Injectable()
export class WebhookLeadCommandHandler
  implements CommandHandler<WebhookLeadCommand, void>
{
  constructor(private readonly captureLeadHandler: CaptureLeadCommandHandler) {}

  async handlerAsync(command: WebhookLeadCommand): Promise<void> {
    const normalized = this.normalizePayload(
      command.platform,
      command.payload ?? {}
    );

    await this.captureLeadHandler.handlerAsync({
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      email: normalized.email,
      mobileNumber: normalized.mobileNumber,
      source: this.platformToSource(command.platform),
      formData: normalized.formData,
    });
  }

  private normalizePayload(
    platform: WebhookPlatform,
    payload: Record<string, any>
  ): {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    formData?: Record<string, string>;
  } {
    switch (platform) {
      case 'google-forms': {
        const responses = payload['event']?.['response'] ?? payload;
        return {
          firstName: responses['firstName'] ?? responses['first_name'],
          lastName: responses['lastName'] ?? responses['last_name'],
          email: responses['email'],
          mobileNumber: responses['mobileNumber'] ?? responses['phone'],
          formData: this.flattenToStringMap(responses),
        };
      }
      case 'linkedin':
      case 'facebook': {
        const data = payload['lead_gen_data'] ?? payload;
        return {
          firstName: data['first_name'] ?? data['firstName'],
          lastName: data['last_name'] ?? data['lastName'],
          email: data['email'],
          mobileNumber: data['phone_number'] ?? data['phone'],
          formData: this.flattenToStringMap(data),
        };
      }
      case 'website':
      default:
        return {
          firstName: payload['firstName'],
          lastName: payload['lastName'],
          email: payload['email'],
          mobileNumber: payload['mobileNumber'] ?? payload['phone'],
          formData: this.flattenToStringMap(payload),
        };
    }
  }

  private platformToSource(platform: WebhookPlatform): string {
    switch (platform) {
      case 'google-forms':
        return 'Google';
      case 'linkedin':
        return 'LinkedIn';
      case 'facebook':
        return 'Facebook';
      case 'website':
        return 'Website';
      default:
        return 'Other';
    }
  }

  private flattenToStringMap(obj: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        result[key] = String(value);
      }
    }
    return result;
  }
}
