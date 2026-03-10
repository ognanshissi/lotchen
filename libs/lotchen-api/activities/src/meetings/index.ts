export * from './create/create-meeting.command';
export * from './find-all/find-all-meetings.query';
export * from './find-by-id/find-meeting-by-id.query';
export * from './update/update-meeting.command';
export * from './delete/delete-meeting.command';
export * from './set-outcome/set-meeting-outcome.command';
export * from './check-conflicts/check-meeting-conflicts.query';
export * from './find-by-range/find-meetings-by-range.query';
export * from './meetings.controller';

import { CreateMeetingCommandHandler } from './create/create-meeting.command';
import { FindAllMeetingsQueryHandler } from './find-all/find-all-meetings.query';
import { FindMeetingByIdQueryHandler } from './find-by-id/find-meeting-by-id.query';
import { UpdateMeetingCommandHandler } from './update/update-meeting.command';
import { DeleteMeetingCommandHandler } from './delete/delete-meeting.command';
import { SetMeetingOutcomeCommandHandler } from './set-outcome/set-meeting-outcome.command';
import { CheckMeetingConflictsQueryHandler } from './check-conflicts/check-meeting-conflicts.query';
import { FindMeetingsByRangeQueryHandler } from './find-by-range/find-meetings-by-range.query';

export const meetingsModuleHandlers = [
  CreateMeetingCommandHandler,
  FindAllMeetingsQueryHandler,
  FindMeetingByIdQueryHandler,
  UpdateMeetingCommandHandler,
  DeleteMeetingCommandHandler,
  SetMeetingOutcomeCommandHandler,
  CheckMeetingConflictsQueryHandler,
  FindMeetingsByRangeQueryHandler,
];
