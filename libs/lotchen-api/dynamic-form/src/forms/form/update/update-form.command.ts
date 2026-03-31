import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class UpdateFormCommand {
  id!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() metadata?: Record<
    string,
    string
  >;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
export class UpdateFormCommandHandler
  implements CommandHandler<UpdateFormCommand, void>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(command: UpdateFormCommand): Promise<void> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');

    const { id, ...updates } = command;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (form as never)[key] = value as never;
      }
    });

    form.updatedBy = this.formsProvider.user().userId;
    form.updatedByInfo = this.formsProvider.user();
    await form.save();
  }
}
