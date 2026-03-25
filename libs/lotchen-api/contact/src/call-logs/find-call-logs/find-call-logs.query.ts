import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ContactProvider } from '../../contacts/contact.provider';

export class FindAllCallLogsQuery {
  @ApiProperty({
    description: 'Entity type on which the call log is related',
    type: String,
  })
  @IsNotEmpty()
  public entityId!: string;
}

class FromAgentLiteDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  firstName!: string;

  @ApiProperty({ type: String })
  lastName!: string;

  @ApiProperty({ type: String })
  email!: string;
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
  public duration!: number;

  @ApiProperty({ description: 'Call status' })
  public status!: string;

  @ApiProperty({ description: 'Call note' })
  public note!: string;

  @ApiProperty({ type: Date, description: 'Call start date' })
  public startDate!: Date;

  @ApiPropertyOptional({ type: Date, description: 'Call end date' })
  public endDate!: Date | null;

  @ApiPropertyOptional({
    type: FromAgentLiteDto,
    description: 'Agent who placed the call',
  })
  public fromAgentLite!: FromAgentLiteDto | null;

  @ApiProperty({ type: Date, description: 'Created date' })
  public createdAt!: Date;

  @ApiPropertyOptional({ description: 'Call direction (inbound/outbound)' })
  public direction!: string;

  @ApiPropertyOptional({ description: 'Telephony provider' })
  public provider!: string;

  @ApiPropertyOptional({ description: 'Call disposition' })
  public disposition!: string;

  @ApiPropertyOptional({ type: Date, description: 'Follow-up date' })
  public followUpDate!: Date | null;

  @ApiPropertyOptional({ description: 'Follow-up action' })
  public followUpAction!: string;

  @ApiPropertyOptional({ description: 'Recording URL' })
  public recordingUrl!: string;
}

@Injectable()
export class FindAllCallLogsQueryHandler
  implements QueryHandler<FindAllCallLogsQuery, FindAllCallLogsQueryResponse[]>
{
  public constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(
    query?: FindAllCallLogsQuery | undefined
  ): Promise<FindAllCallLogsQueryResponse[]> {
    const callLogs = await this._contactProvider.CallLogModel.find(
      {
        relatedToId: query?.entityId,
      },
      'id relatedToId callSid recipientContact duration status note startDate endDate fromAgentLite createdAt direction provider disposition followUpDate followUpAction recordingUrl'
    )
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    if (!callLogs.length) return [];

    return callLogs.map((callLog) => ({
      id: callLog.id,
      relatedToId: callLog.relatedToId,
      callSid: callLog.callSid,
      recipientContact: callLog.recipientContact,
      duration: callLog.duration,
      status: callLog.status,
      note: callLog.note ?? '',
      startDate: callLog.startDate,
      endDate: callLog.endDate ?? null,
      fromAgentLite: callLog.fromAgentLite ?? null,
      createdAt: callLog.createdAt,
      direction: callLog.direction ?? 'outbound',
      provider: callLog.provider ?? 'twilio',
      disposition: callLog.disposition ?? '',
      followUpDate: callLog.followUpDate ?? null,
      followUpAction: callLog.followUpAction ?? 'none',
      recordingUrl: callLog.recordingUrl ?? '',
    }));
  }
}
