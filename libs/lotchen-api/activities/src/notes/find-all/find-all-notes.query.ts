import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class FindAllNotesQuery {
  @ApiProperty({ description: 'The user whom the task is assigned' })
  ownerId!: string;

  @ApiProperty({
    description: 'Entry related to entity, for example contactId',
  })
  relatedToId!: string;

  @ApiProperty({ description: 'Deleted notes', type: String })
  deleted: string | undefined;
}

export class FindAllNotesQueryResponse {
  @ApiProperty({ description: 'Task ID' })
  id!: string;

  @ApiProperty({ description: 'tasks onwer id' })
  ownerId!: string;

  @ApiProperty({ description: 'Related to entity ID' })
  relatedToId!: string;

  @ApiProperty({ description: 'Note content' })
  content!: string;

  @ApiProperty({ type: Date, description: 'Created date' })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Deleted date' })
  deletedAt!: Date | null;
}

@Injectable()
export class FindAllNotesQueryHandler
  implements QueryHandler<FindAllNotesQuery, Array<FindAllNotesQueryResponse>>
{
  private readonly _logger = new Logger(FindAllNotesQueryHandler.name);
  public constructor(
    private readonly _activitiesProvider: ActivitiesProvider
  ) {}
  public async handlerAsync(
    query?: FindAllNotesQuery | undefined
  ): Promise<FindAllNotesQueryResponse[]> {
    try {
      // Query filter
      let queryFilter: any = {};
      if (query?.relatedToId) {
        queryFilter = { ...queryFilter, relatedToId: query.relatedToId };
      }

      if (query?.ownerId) {
        queryFilter = { ...queryFilter, ownerId: query.ownerId };
      }

      if (query?.hasOwnProperty('deleted')) {
        queryFilter = {
          ...queryFilter,
          deletedAt: query.deleted === 'true' ? { $ne: null } : null,
        };
      }

      // projection
      const projection = '_id ownerId relatedToId content createdAt';

      const notes = await this._activitiesProvider.NoteModel.find(
        queryFilter,
        projection,
        { sort: { createdAt: -1 }, limit: 100 } // Sort by createdAt in descending order
      ).exec();

      return notes.map((note) => {
        return {
          id: note._id,
          ownerId: note.ownerId,
          relatedToId: note.relatedToId,
          content: note.content,
          createdAt: note.createdAt,
          deletedAt: note.deletedAt ?? null,
        } as FindAllNotesQueryResponse;
      });
    } catch (error) {
      this._logger.error(
        'Error in FindAllNotesQueryHandler',
        JSON.stringify(error)
      );
      return [];
    }
  }
}
