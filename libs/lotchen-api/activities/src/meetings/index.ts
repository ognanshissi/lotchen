export * from './create/create-meeting.command';
export * from './find-all/find-all-meetings.query';
export * from './meetings.controller';

import { CreateMeetingCommandHandler } from './create/create-meeting.command';
import { FindAllMeetingsQueryHandler } from './find-all/find-all-meetings.query';

export const meetingsModuleHandlers = [
  CreateMeetingCommandHandler,
  FindAllMeetingsQueryHandler,
];
