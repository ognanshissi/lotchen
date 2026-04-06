import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { ClientsProvider } from '../../clients.provider';
import {
  ClientStatus,
  KycStatus,
  AccountType,
} from '../../common/client.enums';

export class UpdateClientCommand {
  id!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mobileNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() dateOfBirth?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() addresses?: any[];
  @ApiPropertyOptional() @IsOptional() @IsEnum(ClientStatus) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(KycStatus) kycStatus?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() creditScore?: number;
  @ApiPropertyOptional() @IsOptional() monthlyIncome?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() employmentStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToUserId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToTeamId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() territoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() agencyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() productIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() policyIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() customFields?: Record<string, string>;
  @ApiPropertyOptional() @IsOptional() @IsArray() notes?: string[];
}

@Injectable()
export class UpdateClientCommandHandler
  implements CommandHandler<UpdateClientCommand, void>
{
  constructor(private readonly clientsProvider: ClientsProvider) {}

  async handlerAsync(command: UpdateClientCommand): Promise<void> {
    const client = await this.clientsProvider.ClientModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!client) throw new NotFoundException('Client introuvable');

    const { id, ...updates } = command;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (client as never)[key] = value as never;
      }
    });

    client.updatedBy = this.clientsProvider.user().userId;
    client.updatedByInfo = this.clientsProvider.user();
    await client.save();
  }
}
