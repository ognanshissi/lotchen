export * from './create/create-message-template.command';
export * from './update/update-message-template.command';
export * from './find-by-id/find-message-template-by-id.query';
export * from './find-all/find-all-message-templates.query';
export * from './delete/delete-message-template.command';
export * from './message-templates.controller';
export * from './message-template.schema';

import { CreateMessageTemplateCommandHandler } from './create/create-message-template.command';
import { UpdateMessageTemplateCommandHandler } from './update/update-message-template.command';
import { FindMessageTemplateByIdQueryHandler } from './find-by-id/find-message-template-by-id.query';
import { FindAllMessageTemplatesQueryHandler } from './find-all/find-all-message-templates.query';
import { DeleteMessageTemplateCommandHandler } from './delete/delete-message-template.command';

export const templateModuleHandlers = [
  CreateMessageTemplateCommandHandler,
  UpdateMessageTemplateCommandHandler,
  FindMessageTemplateByIdQueryHandler,
  FindAllMessageTemplatesQueryHandler,
  DeleteMessageTemplateCommandHandler,
];
