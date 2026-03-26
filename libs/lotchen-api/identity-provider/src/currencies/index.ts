import { CurrenciesProvider } from './currencies.provider';
import { CreateCurrencyCommandHandler } from './create/create-currency.command';
import { FindAllCurrenciesQueryHandler } from './find-all/find-all-currencies.query';
import { UpdateCurrencyCommandHandler } from './update/update-currency.command';
import { DeleteCurrencyCommandHandler } from './delete/delete-currency.command';
import { SetDefaultCurrencyCommandHandler } from './set-default/set-default-currency.command';

export * from './currency.schema';
export * from './currencies.controller';
export * from './create/create-currency.command';
export * from './find-all/find-all-currencies.query';
export * from './update/update-currency.command';
export * from './delete/delete-currency.command';
export * from './set-default/set-default-currency.command';

export const currenciesHandlers = [
  CurrenciesProvider,
  CreateCurrencyCommandHandler,
  FindAllCurrenciesQueryHandler,
  UpdateCurrencyCommandHandler,
  DeleteCurrencyCommandHandler,
  SetDefaultCurrencyCommandHandler,
];
