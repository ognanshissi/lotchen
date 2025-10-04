import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { CommandHandler } from '@lotchen/api/core';

export class FieldDto {
  @ApiProperty({ required: true, description: 'Field name', type: String })
  fieldName!: string;
  @ApiProperty({ required: true, description: 'Field value', type: String })
  fieldValue!: string;
}

export class PatchDataCommandRequest {
  @ApiProperty({
    required: true,
    description: 'Fields',
    items: { $ref: getSchemaPath(FieldDto) },
    type: 'array',
  })
  fields!: FieldDto[] | [];
}

export class PatchDataCommand extends PatchDataCommandRequest {
  @ApiProperty({
    required: true,
    description: 'The contact uuid, who will be affected by the change',
    type: String,
  })
  id!: string;
}

@Injectable()
export class PatchDataCommandHandler
  implements CommandHandler<PatchDataCommand, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: PatchDataCommand): Promise<void> {
    if (!command.fields?.length) {
      throw new NotFoundException('No field to update');
    }

    const contact = await this.contactProvider.ContactModel.findById(
      command.id,
      {}
    ).exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    for (const field of command.fields) {
      (contact as any)[field.fieldName] = field.fieldValue;
    }

    await contact.save();
  }
}
