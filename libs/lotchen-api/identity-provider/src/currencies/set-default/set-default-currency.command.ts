import { CommandHandler } from '@lotchen/api/core';
import { CurrenciesProvider } from '../currencies.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

export class SetDefaultCurrencyCommand {
  id!: string;
}

@Injectable()
export class SetDefaultCurrencyCommandHandler
  implements CommandHandler<SetDefaultCurrencyCommand, void>
{
  constructor(private readonly currenciesProvider: CurrenciesProvider) {}

  public async handlerAsync(command: SetDefaultCurrencyCommand): Promise<void> {
    const currency = await this.currenciesProvider.CurrencyModel.findOne({
      _id: command.id,
      deletedAt: null,
    });

    if (!currency) {
      throw new NotFoundException('Devise introuvable');
    }

    await this.currenciesProvider.CurrencyModel.updateMany(
      { isDefault: true, deletedAt: null },
      { $set: { isDefault: false } }
    );

    currency.isDefault = true;
    await currency.save();
  }
}
