import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CommandHandler } from '@lotchen/api/core';
import { ContactProvider } from '../../contacts/contact.provider';
import { Injectable } from '@nestjs/common';

export class CreateCallLogCommand {
  @ApiProperty({ description: 'Entity Id, ContactId / ClientId' })
  @IsNotEmpty()
  toId!: string;

  @ApiProperty({ description: 'Contact number', type: String, required: true })
  toContact!: string;

  @ApiProperty({ description: 'Twilio Call SID', required: true, type: String })
  @IsNotEmpty()
  callSid!: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'Contact, Client',
    enum: ['Contact', 'Client'],
    default: 'Contact',
  })
  @IsNotEmpty()
  entityType!: ['Contact', 'Client'];

  @ApiProperty({ description: 'Call duration in seconds', type: Number })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  duration!: number;

  @ApiProperty({ description: 'Call started date', type: Date })
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({ description: 'Call ended dated', type: Date })
  @IsNotEmpty()
  endDate!: Date;

  @ApiProperty({ description: 'Call Status' })
  status!: string;

  @ApiPropertyOptional({
    description: 'Call direction',
    enum: ['inbound', 'outbound'],
  })
  @IsOptional()
  direction?: string;

  @ApiPropertyOptional({
    description: 'Telephony provider',
    enum: ['twilio', 'ringover', 'asterisk'],
  })
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Recording URL' })
  @IsOptional()
  recordingUrl?: string;

  @ApiPropertyOptional({ description: 'Recording SID' })
  @IsOptional()
  recordingSid?: string;

  @ApiPropertyOptional({ description: 'Call disposition' })
  @IsOptional()
  disposition?: string;

  @ApiPropertyOptional({ description: 'Call note' })
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsOptional()
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Follow-up action' })
  @IsOptional()
  followUpAction?: string;
}

@Injectable()
export class CreateCallLogCommandHandler
  implements CommandHandler<CreateCallLogCommand, any>
{
  public constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(command: CreateCallLogCommand): Promise<any> {
    const user = this._contactProvider.user();
    const callLog = new this._contactProvider.CallLogModel({
      startDate: command.startDate,
      endDate: command.endDate,
      callSid: command.callSid,
      duration: command.duration,
      entityType: 'Contact',
      fromAgentId: user.userId,
      fromAgentLite: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      relatedToId: command.toId,
      recipientContact: command.toContact,
      status: command.status,
      direction: command.direction ?? 'outbound',
      provider: command.provider ?? 'twilio',
      recordingUrl: command.recordingUrl ?? '',
      recordingSid: command.recordingSid ?? '',
      disposition: command.disposition ?? '',
      note: command.note ?? '',
      followUpDate: command.followUpDate,
      followUpAction: command.followUpAction ?? 'none',
    });

    await callLog.save();
  }
}
