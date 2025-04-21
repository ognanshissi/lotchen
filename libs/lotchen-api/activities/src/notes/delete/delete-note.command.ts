import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ActivitiesProvider } from '../../activities.provider';
import { IsNotEmpty } from 'class-validator';

export class DeleteNoteComamnd {
  @IsNotEmpty()
  noteId!: string;
}

@Injectable()
export class DeleteNoteCommandHandler
  implements CommandHandler<DeleteNoteComamnd, void>
{
  private readonly _logger = new Logger(DeleteNoteCommandHandler.name);
  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}
  public async handlerAsync(command: DeleteNoteComamnd): Promise<void> {
    try {
      const note = await this._activitiesProvider.NoteModel.findById(
        command.noteId,
        'id deletedAt'
      )
        .lean()
        .exec();
      if (!note) {
        throw new BadRequestException('Note not found');
      }
      note.deletedAt = new Date();
      await note.save();
    } catch (error) {
      this._logger.error(
        `Error while deleting note with id ${command.noteId}: ${error}`
      );
      throw error;
    }
  }
}
