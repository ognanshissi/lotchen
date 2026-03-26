import { CommandHandler } from '@lotchen/api/core';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaptureConfigProvider } from '../capture-config/capture-config.provider';
import { CaptureLeadCommandHandler } from './capture-lead.command';

class LinkedInCommenter {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  profileUrl!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  headline?: string;
}

export class ImportLinkedInPostCommandRequest {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  postUrl!: string;

  @ApiProperty({ type: [LinkedInCommenter] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkedInCommenter)
  commenters!: LinkedInCommenter[];
}

export class ImportLinkedInPostCommand extends ImportLinkedInPostCommandRequest {
  configId!: string;
}

export class ImportLinkedInPostResponse {
  @ApiProperty()
  imported!: number;

  @ApiProperty()
  skipped!: number;
}

@Injectable()
export class ImportLinkedInPostCommandHandler
  implements
    CommandHandler<ImportLinkedInPostCommand, ImportLinkedInPostResponse>
{
  private readonly _logger = new Logger(ImportLinkedInPostCommandHandler.name);

  constructor(
    private readonly configProvider: CaptureConfigProvider,
    private readonly captureHandler: CaptureLeadCommandHandler
  ) {}

  async handlerAsync(
    command: ImportLinkedInPostCommand
  ): Promise<ImportLinkedInPostResponse> {
    const config = await this.configProvider.CaptureConfigModel.findOne({
      _id: command.configId,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!config) {
      throw new NotFoundException('Configuration de capture introuvable');
    }

    if (config.platform !== 'linkedin') {
      throw new BadRequestException(
        'Cette configuration ne concerne pas LinkedIn'
      );
    }

    let imported = 0;
    let skipped = 0;

    for (const commenter of command.commenters) {
      // Dedup by LinkedIn profile URL
      const existing = await this.configProvider.ContactModel.findOne({
        'customFields.capture_linkedin_profile_url': commenter.profileUrl,
        deletedAt: null,
      })
        .lean()
        .exec();

      if (existing) {
        skipped++;
        continue;
      }

      try {
        await this.captureHandler.handlerAsync({
          firstName: commenter.firstName,
          lastName: commenter.lastName,
          source: 'LinkedIn',
          apiKey: config.apiKey,
          formData: {
            linkedin_profile_url: commenter.profileUrl,
            headline: commenter.headline ?? '',
            post_url: command.postUrl,
          },
        });
        imported++;
      } catch (error) {
        this._logger.warn(`Failed to import commenter ${commenter.profileUrl}`);
        skipped++;
      }
    }

    return { imported, skipped };
  }
}
