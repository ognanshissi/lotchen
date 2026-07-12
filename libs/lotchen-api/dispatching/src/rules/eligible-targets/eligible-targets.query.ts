import { QueryHandler } from '@lotchen/api/core';
import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { AssignmentTargetType } from '../../common/dispatch-rule.enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class EligibleTargetResponse {
  @ApiProperty()
  id!: string;
  @ApiProperty({
    enum: AssignmentTargetType,
    description: 'AssignmentTargetType',
  })
  @IsEnum(AssignmentTargetType)
  type!: AssignmentTargetType;
  @ApiProperty()
  label!: string;
  @ApiProperty()
  subLabel?: string;
}

export class EligibleTargetsQuery {}

@Injectable()
export class EligibleTargetsQueryHandler
  implements QueryHandler<EligibleTargetsQuery, EligibleTargetResponse[]>
{
  constructor(
    @Inject('TENANT_CONNECTION') private readonly connection: Connection
  ) {}

  async handlerAsync(
    _query: EligibleTargetsQuery
  ): Promise<EligibleTargetResponse[]> {
    const db = this.connection.db;
    if (!db) return [];

    const [profiles, teams] = await Promise.all([
      db
        .collection('identity_profiles')
        .find(
          { deletedAt: null },
          { projection: { _id: 1, firstName: 1, lastName: 1, contactInfo: 1 } }
        )
        .toArray(),
      db
        .collection('identity_teams')
        .find(
          { deletedAt: null },
          { projection: { _id: 1, name: 1, description: 1 } }
        )
        .toArray(),
    ]);

    const agentTargets: EligibleTargetResponse[] = profiles.map((p: any) => ({
      id: String(p._id),
      type: AssignmentTargetType.Agent,
      label: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Agent',
      subLabel: p.contactInfo?.email,
    }));

    const teamTargets: EligibleTargetResponse[] = teams.map((t: any) => ({
      id: String(t._id),
      type: AssignmentTargetType.Team,
      label: t.name ?? 'Équipe',
      subLabel: t.description,
    }));

    return [...agentTargets, ...teamTargets];
  }
}
