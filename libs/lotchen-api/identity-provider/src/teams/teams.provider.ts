import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Team } from './team.schema';

export const TEAM_MODEL_PROVIDER = 'TEAM_MODEL';

@Injectable()
export class TeamsProvider {
  constructor(
    @Inject(TEAM_MODEL_PROVIDER)
    public readonly TeamModel: Model<Team>
  ) {}
}
