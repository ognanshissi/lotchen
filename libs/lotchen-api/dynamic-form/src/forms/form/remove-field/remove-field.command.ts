import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { FormsProvider } from '../../forms.provider';

export class RemoveFieldCommand {
  formId!: string;
  fieldId!: string;
}

@Injectable()
export class RemoveFieldCommandHandler
  implements CommandHandler<RemoveFieldCommand, void>
{
  constructor(private readonly formsProvider: FormsProvider) {}

  async handlerAsync(command: RemoveFieldCommand): Promise<void> {
    const form = await this.formsProvider.FormModel.findOne({
      _id: command.formId,
      deletedAt: null,
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');

    const fieldIndex = form.fields.findIndex(
      (f) => f._id?.toString() === command.fieldId
    );
    if (fieldIndex === -1) throw new NotFoundException('Champ introuvable');

    const field = form.fields[fieldIndex];
    if (!field.custom) {
      throw new BadRequestException('Impossible de supprimer un champ système');
    }

    form.fields.splice(fieldIndex, 1);
    form.updatedBy = this.formsProvider.user().userId;
    form.updatedByInfo = this.formsProvider.user();
    await form.save();
  }
}
