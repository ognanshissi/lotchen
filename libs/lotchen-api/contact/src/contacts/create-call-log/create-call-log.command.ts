import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CommandHandler } from '@lotchen/api/core';
import { Request } from 'express';
import { ContactProvider } from '../contact.provider';

export class CreateCallLogCommand {
  @ApiProperty({ description: 'Entity Id, ContactId / ClientId' })
  entityId!: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'Contact, Client',
    enum: ['Contact', 'Client'],
    default: 'Contact',
  })
  entityType!: ['Contact', 'Client'];

  @ApiProperty({ description: 'Call duration in seconds', type: Number })
  @IsInt()
  @Type(() => Number)
  duration!: number;

  @ApiProperty({ description: 'Call started date', type: Date })
  startDate!: Date;

  @ApiProperty({ description: 'Call ended dated', type: Date })
  endDate!: Date;

  @ApiProperty({ description: 'Call Status' })
  status!: string;
}

export class CreateCallLogCommandHandler
  implements CommandHandler<CreateCallLogCommand, any>
{
  public constructor(private readonly _contactProvider: ContactProvider) {}

  public async handlerAsync(
    command: CreateCallLogCommand,
    req?: Request
  ): Promise<any> {
    console.log(command);
  }
}
