import { CreateTeamCommandHandler } from './create/create-team.command';
import { Connection } from 'mongoose';
import { Team, TeamSchema } from './team.schema';
import { TEAM_MODEL_PROVIDER, TeamsProvider } from './teams.provider';
import { FindAllTeamsQueryHandler } from './find-all/find-all-teams.query';
import { DeleteTeamCommandHandler } from './delete/delete-team.command';
import { UpdateTeamCommandHandler } from './update/update-team.command';

export * from './team.schema';
export * from './teams.controller';

export const teamsHandlers = [
  {
    provide: TEAM_MODEL_PROVIDER,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Team.name, TeamSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  TeamsProvider,
  CreateTeamCommandHandler,
  FindAllTeamsQueryHandler,
  DeleteTeamCommandHandler,
  UpdateTeamCommandHandler,
];
