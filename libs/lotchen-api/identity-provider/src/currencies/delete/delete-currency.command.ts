import { CommandHandler } from '@lotchen/api/core';
import { CurrenciesProvider } from '../currencies.provider';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

export class DeleteCurrencyCommand {
  id!: string;
}

@Injectable()
export class DeleteCurrencyCommandHandler
  implements CommandHandler<DeleteCurrencyCommand, void>
{
  constructor(private readonly currenciesProvider: CurrenciesProvider) {}

  public async handlerAsync(command: DeleteCurrencyCommand): Promise<void> {
    const currency = await this.currenciesProvider.CurrencyModel.findOne({
      _id: command.id,
      deletedAt: null,
    });

    if (!currency) {
      throw new NotFoundException('Devise introuvable');
    }

    if (currency.isDefault) {
      throw new BadRequestException(
        'Impossible de supprimer la devise par défaut'
      );
    }

    currency.deletedAt = new Date();
    await currency.save();
  }
}
