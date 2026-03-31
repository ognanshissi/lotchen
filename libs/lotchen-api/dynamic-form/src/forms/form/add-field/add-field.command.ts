import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';
import { FieldType } from '../../field.schema';

export class AddFieldCommand {
  formId!: string;

  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
  @ApiProperty() @IsNotEmpty() @IsString() label!: string;
  @ApiProperty({ enum: FieldType })
  @IsNotEmpty()
  @IsEnum(FieldType)
  type!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() hint?: string;
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class AddFieldCommandResponse {
  @ApiProperty() fieldId!: string;
}

@Injectable()
export class AddFieldCommandHandler
  implements CommandHandler<AddFieldCommand, AddFieldCommandResponse>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(
    command: AddFieldCommand
  ): Promise<AddFieldCommandResponse> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: command.formId,
      deletedAt: null,
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');

    const maxPosition = form.fields.reduce(
      (max, f) => Math.max(max, f.position),
      -1
    );

    const { formId, ...fieldData } = command;
    form.fields.push({
      ...fieldData,
      custom: true,
      visible: command.visible ?? true,
      required: command.required ?? false,
      position: maxPosition + 1,
    } as never);

    form.updatedBy = this.formsProvider.user().userId;
    form.updatedByInfo = this.formsProvider.user();
    await form.save();

    const addedField = form.fields[form.fields.length - 1];
    return { fieldId: addedField._id };
  }
}
