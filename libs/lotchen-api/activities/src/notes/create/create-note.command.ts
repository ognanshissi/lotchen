import { CommandHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class CreateNoteCommand {
  @ApiProperty({
    description: 'RelatedToId, ContactId, ClientId, DealId',
    type: String,
  })
  relatedToId!: string;

  @ApiProperty({ description: 'Note owner Id', type: String })
  ownerId!: string;

  @ApiProperty({ description: 'Note content', type: String })
  content!: string;
}

@Injectable()
export class CreateNoteCommandHandler
  implements CommandHandler<CreateNoteCommand, void>
{
  constructor(public readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: CreateNoteCommand): Promise<void> {
    const note = new this._activitiesProvider.NoteModel({
      relatedToId: command.relatedToId, // contactId, clientId, dealId
      ownerId: command.ownerId,
      content: command.content,
      createdBy: this._activitiesProvider.currentUserInfo()?.userId,
      createdByInfo: this._activitiesProvider.currentUserInfo(),
    });

    await note.save();
  }
}
