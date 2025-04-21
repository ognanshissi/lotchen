import { CreateNoteCommandHandler } from './create/create-note.command';
import { DeleteNoteCommandHandler } from './delete/delete-note.command';
import { FindAllNotesQueryHandler } from './find-all/find-all-notes.query';

export * from './create/create-note.command';
export * from './notes.controller';
export * from './find-all/find-all-notes.query';
export * from './delete/delete-note.command';

export const notesModuleHandlers = [
  CreateNoteCommandHandler,
  FindAllNotesQueryHandler,
  DeleteNoteCommandHandler,
];
