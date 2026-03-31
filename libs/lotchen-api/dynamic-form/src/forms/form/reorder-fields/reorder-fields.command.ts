import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class ReorderFieldsCommand {
  formId!: string;

  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  fieldIds!: string[];
}

@Injectable()
export class ReorderFieldsCommandHandler
  implements CommandHandler<ReorderFieldsCommand, void>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(command: ReorderFieldsCommand): Promise<void> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: command.formId,
      deletedAt: null,
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');

    command.fieldIds.forEach((fieldId, index) => {
      const field = form.fields.find((f) => f._id?.toString() === fieldId);
      if (field) {
        field.position = index;
      }
    });

    form.updatedBy = this.formsProvider.user().userId;
    form.updatedByInfo = this.formsProvider.user();
    await form.save();
  }
}
