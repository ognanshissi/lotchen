export * from './create/create-meeting.command';
export * from './meetings.controller';

import { CreateMeetingCommandHandler } from './create/create-meeting.command';

export const meetingsModuleHandlers = [CreateMeetingCommandHandler];
