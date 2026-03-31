import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class CreateFormCommand {
  @ApiProperty() @IsNotEmpty() @IsString() formClass!: string;
  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
  @ApiProperty({ required: false }) @IsOptional() metadata?: Record<
    string,
    string
  >;
}

export class CreateFormCommandResponse {
  @ApiProperty() id!: string;
}

@Injectable()
export class CreateFormCommandHandler
  implements CommandHandler<CreateFormCommand, CreateFormCommandResponse>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(
    command: CreateFormCommand
  ): Promise<CreateFormCommandResponse> {
    const form = new this.formsProvider.FormModel({
      ...command,
      fields: [],
      createdBy: this.formsProvider.user().userId,
      createdByInfo: this.formsProvider.user(),
    });
    await form.save();
    return { id: form._id };
  }
}
