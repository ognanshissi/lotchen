import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ContactProvider } from '../../contacts/contact.provider';
import { create } from 'domain';

export class FindAllCallLogsQuery {
  @ApiProperty({
    description: 'Entity type on which the call log is related',
    type: String,
  })
  @IsNotEmpty()
  public entityId!: string;
}

export class FindAllCallLogsQueryResponse {
  @ApiProperty({ description: 'Call log id' })
  public id!: string;

  @ApiProperty({ description: 'Related entity id, e.g., ContactId / ClientId' })
  public relatedToId!: string;

  @ApiProperty({ description: 'Twilio call SID' })
  public callSid!: string;

  @ApiProperty({ description: "Recipient's contact number" })
  public recipientContact!: string;

  @ApiProperty({ description: 'Call duration in seconds' })
  public duration!: number; // seconds

  @ApiProperty({ description: 'Call status' })
  public status!: string;
}

@Injectable()
export class FindAllCallLogsQueryHandler
  implements QueryHandler<FindAllCallLogsQuery, FindAllCallLogsQueryResponse[]>
{
  public constructor(private readonly _contactProvider: ContactProvider) {}

  /**
   *
   * @param query
   */
  public async handlerAsync(
    query?: FindAllCallLogsQuery | undefined
  ): Promise<FindAllCallLogsQueryResponse[]> {
    const callLogs = await this._contactProvider.CallLogModel.find(
      {
        relatedToId: query?.entityId,
      },
      'id relatedToId callSid recipientContact duration status createdAt'
    )
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    return callLogs.map((callLog) => ({
      id: callLog.id,
      relatedToId: callLog.relatedToId,
      callSid: callLog.callSid,
      recipientContact: callLog.recipientContact,
      duration: callLog.duration,
      status: callLog.status,
    }));
  }
}
