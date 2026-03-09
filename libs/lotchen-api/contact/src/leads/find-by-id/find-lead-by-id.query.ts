import { QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { ContactTypeEnum } from '../../contacts/contact.schema';

export class FindLeadByIdQuery {
  @ApiProperty({ required: true, description: 'Lead Id', type: String })
  id!: string;
}

class StatusHistoryDto {
  @ApiProperty({ type: String })
  previousStatus!: string;

  @ApiProperty({ type: String })
  status!: string;

  @ApiProperty({ type: Date })
  changedAt!: Date;

  @ApiProperty({ type: String })
  changedBy!: string;
}

class CreatedByInfoDto {
  @ApiProperty({ type: String })
  userId!: string;

  @ApiProperty({ type: String })
  firstName!: string;

  @ApiProperty({ type: String })
  lastName!: string;

  @ApiProperty({ type: String })
  email!: string;
}

export class FindLeadByIdQueryResponse {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  email!: string;

  @ApiProperty({ type: String })
  firstName!: string;

  @ApiProperty({ type: String })
  lastName!: string;

  @ApiProperty({ type: String })
  mobileNumber!: string;

  @ApiPropertyOptional({ type: String })
  phone!: string | null;

  @ApiPropertyOptional({ type: Date })
  dateOfBirth!: Date | null;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: String })
  source!: string;

  @ApiProperty({ type: String })
  status!: string;

  @ApiPropertyOptional({ type: String })
  gender!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiPropertyOptional({ type: String })
  companyName!: string | null;

  @ApiPropertyOptional({ type: String })
  jobTitle!: string | null;

  @ApiPropertyOptional({ type: String })
  assignedToUserId!: string | null;

  @ApiPropertyOptional({ type: String })
  assignedToTeamId!: string | null;

  @ApiPropertyOptional({ type: String })
  territoryId!: string | null;

  @ApiPropertyOptional({ type: String })
  agencyId!: string | null;

  @ApiPropertyOptional({ type: CreatedByInfoDto })
  createdByInfo!: CreatedByInfoDto | null;

  @ApiProperty({ type: [StatusHistoryDto] })
  statusHistory!: StatusHistoryDto[];

  @ApiPropertyOptional({ type: String })
  productInterest!: string | null;

  @ApiPropertyOptional({ type: Number })
  estimatedValue!: number | null;

  @ApiPropertyOptional({ type: String })
  priority!: string | null;

  @ApiPropertyOptional({ type: String })
  notes!: string | null;

  @ApiPropertyOptional({ type: String })
  bantBudget!: string | null;

  @ApiPropertyOptional({ type: String })
  bantAuthority!: string | null;

  @ApiPropertyOptional({ type: String })
  bantNeed!: string | null;

  @ApiPropertyOptional({ type: String })
  bantTimeline!: string | null;

  @ApiPropertyOptional({ type: String })
  disqualificationReason!: string | null;

  @ApiPropertyOptional({ type: Number })
  score!: number;
}

@Injectable()
export class FindLeadByIdQueryHandler
  implements QueryHandler<FindLeadByIdQuery, FindLeadByIdQueryResponse>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(
    query: FindLeadByIdQuery
  ): Promise<FindLeadByIdQueryResponse> {
    const lead = await this.leadProvider.ContactModel.findOne({
      _id: query.id,
      type: ContactTypeEnum.Lead,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const cf = (lead.customFields as Record<string, string>) ?? {};

    return {
      id: lead._id,
      email: lead.email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      mobileNumber: lead.mobileNumber,
      phone: lead.phone ?? null,
      dateOfBirth: lead.dateOfBirth ?? null,
      createdAt: lead.createdAt,
      source: lead.source,
      status: lead.status,
      gender: lead.gender ?? null,
      tags: lead.tags ?? [],
      companyName: lead.companyName ?? null,
      jobTitle: lead.jobTitle ?? null,
      assignedToUserId: lead.assignedToUserId ?? null,
      assignedToTeamId: lead.assignedToTeamId ?? null,
      territoryId: lead.territoryId ?? null,
      agencyId: lead.agencyId ?? null,
      createdByInfo: lead.createdByInfo ?? null,
      statusHistory: (lead.statusHistory ?? []).map((sh: any) => ({
        previousStatus: sh.previousStatus,
        status: sh.status,
        changedAt: sh.changedAt,
        changedBy: sh.changedBy,
      })),
      productInterest: cf['productInterest'] ?? null,
      estimatedValue: cf['estimatedValue']
        ? Number(cf['estimatedValue'])
        : null,
      priority: cf['priority'] ?? null,
      notes: cf['notes'] ?? null,
      bantBudget: cf['bant_budget'] ?? null,
      bantAuthority: cf['bant_authority'] ?? null,
      bantNeed: cf['bant_need'] ?? null,
      bantTimeline: cf['bant_timeline'] ?? null,
      disqualificationReason: cf['disqualificationReason'] ?? null,
      score: (lead as any).score ?? 0,
    };
  }
}
