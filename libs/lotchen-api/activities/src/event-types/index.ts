export * from './create/create-event-type.command';
export * from './find-all/find-all-event-types.query';
export * from './find-by-id/find-event-type-by-id.query';
export * from './update/update-event-type.command';
export * from './delete/delete-event-type.command';
export * from './seed/seed-event-types.command';
export * from './event-types.controller';
export * from './event-type.schema';

import { CreateEventTypeCommandHandler } from './create/create-event-type.command';
import { FindAllEventTypesQueryHandler } from './find-all/find-all-event-types.query';
import { FindEventTypeByIdQueryHandler } from './find-by-id/find-event-type-by-id.query';
import { UpdateEventTypeCommandHandler } from './update/update-event-type.command';
import { DeleteEventTypeCommandHandler } from './delete/delete-event-type.command';
import { SeedEventTypesCommandHandler } from './seed/seed-event-types.command';

export const eventTypesModuleHandlers = [
  CreateEventTypeCommandHandler,
  FindAllEventTypesQueryHandler,
  FindEventTypeByIdQueryHandler,
  UpdateEventTypeCommandHandler,
  DeleteEventTypeCommandHandler,
  SeedEventTypesCommandHandler,
];
