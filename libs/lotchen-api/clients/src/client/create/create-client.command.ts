import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
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

export class CreateClientCommand {
  @ApiProperty() @IsNotEmpty() @IsString() contactId!: string;
  @ApiProperty() @IsNotEmpty() @IsString() firstName!: string;
  @ApiProperty() @IsNotEmpty() @IsString() lastName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiProperty() @IsNotEmpty() @IsString() mobileNumber!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() dateOfBirth?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() addresses?: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() customFields?: Record<string, string>;
  @ApiPropertyOptional() @IsOptional() @IsArray() notes?: string[];
}

export class CreateClientCommandResponse {
  @ApiProperty() id!: string;
  @ApiProperty() clientNumber!: string;
}

@Injectable()
export class CreateClientCommandHandler
  implements CommandHandler<CreateClientCommand, CreateClientCommandResponse>
{
  constructor(private readonly clientsProvider: ClientsProvider) {}

  async handlerAsync(
    command: CreateClientCommand
  ): Promise<CreateClientCommandResponse> {
    const lastClient = await this.clientsProvider.ClientModel.findOne(
      {},
      { clientNumber: 1 }
    )
      .sort({ clientNumber: -1 })
      .lean()
      .exec();

    let nextNumber = 1;
    if (lastClient?.clientNumber) {
      const num = parseInt(lastClient.clientNumber.replace('CL-', ''), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const clientNumber = `CL-${String(nextNumber).padStart(7, '0')}`;

    const client = new this.clientsProvider.ClientModel({
      ...command,
      clientNumber,
      status: ClientStatus.Active,
      kycStatus: KycStatus.NotStarted,
      accountType: command.accountType ?? AccountType.Individual,
      onboardingDate: new Date(),
      createdBy: this.clientsProvider.user().userId,
      createdByInfo: this.clientsProvider.user(),
    });

    await client.save();
    return { id: client._id, clientNumber: client.clientNumber };
  }
}
