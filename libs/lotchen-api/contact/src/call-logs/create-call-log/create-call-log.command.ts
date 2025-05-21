import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
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
}

@Injectable()
export class CreateCallLogCommandHandler
  implements CommandHandler<CreateCallLogCommand, any>
{
  public constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(command: CreateCallLogCommand): Promise<any> {
    const callLog = new this._contactProvider.CallLogModel({
      startDate: command.startDate,
      endDate: command.endDate,
      callSid: command.callSid,
      duration: command.duration,
      entityType: 'Contact',
      fromAgentId: this._contactProvider.user().userId, // User
      fromAgentLite: {
        id: this._contactProvider.user().userId,
        firstName: this._contactProvider.user().firstName,
        lastName: this._contactProvider.user().lastName,
        email: this._contactProvider.user().email,
      },
      relatedToId: command.toId, // contact, client
      recipientContact: command.toContact,
      status: command.status,
    });

    await callLog.save();
  }
}
