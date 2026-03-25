import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { ContactProvider } from '../../contacts/contact.provider';

export class RecordingCallbackCommand {
  @ApiProperty({ description: 'Twilio Call SID' })
  @IsNotEmpty()
  callSid!: string;

  @ApiProperty({ description: 'Recording URL' })
  @IsNotEmpty()
  recordingUrl!: string;

  @ApiProperty({ description: 'Recording SID' })
  @IsNotEmpty()
  recordingSid!: string;
}

@Injectable()
export class RecordingCallbackCommandHandler
  implements CommandHandler<RecordingCallbackCommand, void>
{
  constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(command: RecordingCallbackCommand): Promise<void> {
    await this._contactProvider.CallLogModel.updateOne(
      { callSid: command.callSid },
      {
        $set: {
          recordingUrl: command.recordingUrl,
          recordingSid: command.recordingSid,
        },
      }
    );
  }
}
