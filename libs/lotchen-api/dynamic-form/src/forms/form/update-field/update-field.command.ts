import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class UpdateFieldCommandRequest {
  @ApiProperty({ required: false }) @IsOptional() @IsString() label?: string;
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

export class UpdateFieldCommand extends UpdateFieldCommandRequest {
  @ApiProperty()
  @IsString()
  formId!: string;
  @ApiProperty()
  @IsString()
  fieldId!: string;
}

@Injectable()
export class UpdateFieldCommandHandler
  implements CommandHandler<UpdateFieldCommand, void>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(command: UpdateFieldCommand): Promise<void> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: command.formId,
      deletedAt: null,
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');

    const field = form.fields.find(
      (f) => f._id?.toString() === command.fieldId
    );
    if (!field) throw new NotFoundException('Champ introuvable');

    const { formId, fieldId, ...updates } = command;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (field as never)[key] = value as never;
      }
    });

    form.updatedBy = this.formsProvider.user().userId;
    form.updatedByInfo = this.formsProvider.user();
    await form.save();
  }
}
