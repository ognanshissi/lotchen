import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { ClientsProvider } from '../../clients.provider';

export class FindClientByIdQuery {
  id!: string;
}

export class FindClientByIdQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() clientNumber!: string;
  @ApiProperty() contactId!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiPropertyOptional() email?: string;
  @ApiProperty() mobileNumber!: string;
  @ApiPropertyOptional() phone?: string;
  @ApiPropertyOptional() dateOfBirth?: Date;
  @ApiPropertyOptional() gender?: string;
  @ApiPropertyOptional() jobTitle?: string;
  @ApiPropertyOptional() companyName?: string;
  @ApiPropertyOptional() addresses?: any[];
  @ApiPropertyOptional() source?: string;
  @ApiProperty() status!: string;
  @ApiProperty() kycStatus!: string;
  @ApiProperty() accountType!: string;
  @ApiPropertyOptional() onboardingDate?: Date;
  @ApiPropertyOptional() creditScore?: number;
  @ApiPropertyOptional() monthlyIncome?: any;
  @ApiPropertyOptional() employmentStatus?: string;
  @ApiPropertyOptional() assignedToUserId?: string;
  @ApiPropertyOptional() assignedToTeamId?: string;
  @ApiPropertyOptional() territoryId?: string;
  @ApiPropertyOptional() agencyId?: string;
  @ApiPropertyOptional() productIds?: string[];
  @ApiPropertyOptional() policyIds?: string[];
  @ApiPropertyOptional() tags?: string[];
  @ApiPropertyOptional() customFields?: Record<string, string>;
  @ApiPropertyOptional() notes?: string[];
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindClientByIdQueryHandler
  implements QueryHandler<FindClientByIdQuery, FindClientByIdQueryResponse>
{
  constructor(private readonly clientsProvider: ClientsProvider) {}

  async handlerAsync(
    query: FindClientByIdQuery
  ): Promise<FindClientByIdQueryResponse> {
    const client = await this.clientsProvider.ClientModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!client) throw new NotFoundException('Client introuvable');

    return {
      id: client._id,
      clientNumber: client.clientNumber,
      contactId: client.contactId,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      mobileNumber: client.mobileNumber,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth,
      gender: client.gender,
      jobTitle: client.jobTitle,
      companyName: client.companyName,
      addresses: client.addresses,
      source: client.source,
      status: client.status,
      kycStatus: client.kycStatus,
      accountType: client.accountType,
      onboardingDate: client.onboardingDate,
      creditScore: client.creditScore,
      monthlyIncome: client.monthlyIncome,
      employmentStatus: client.employmentStatus,
      assignedToUserId: client.assignedToUserId,
      assignedToTeamId: client.assignedToTeamId,
      territoryId: client.territoryId,
      agencyId: client.agencyId,
      productIds: client.productIds,
      policyIds: client.policyIds,
      tags: client.tags,
      customFields: client.customFields as Record<string, string> | undefined,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
