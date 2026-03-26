import { Injectable, inject, signal, computed } from '@angular/core';
import {
  CurrenciesApiService,
  FindAllCurrenciesQueryResponse,
} from '@talisoft/api/lotchen-client-api';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly _currenciesApi = inject(CurrenciesApiService);

  private readonly _currencies = signal<FindAllCurrenciesQueryResponse[]>([]);
  private readonly _loaded = signal(false);

  public readonly currencies = this._currencies.asReadonly();
  public readonly loaded = this._loaded.asReadonly();

  public readonly defaultCurrency = computed(
    () => this._currencies().find((c) => c.isDefault) ?? null
  );

  public readonly defaultCurrencyCode = computed(
    () => this.defaultCurrency()?.code ?? 'XOF'
  );

  public readonly defaultCurrencySymbol = computed(
    () => this.defaultCurrency()?.symbol ?? 'FCFA'
  );

  public loadCurrencies(): void {
    if (this._loaded()) return;
    this._currenciesApi.currenciesControllerFindAllV1().subscribe({
      next: (data) => {
        this._currencies.set(data);
        this._loaded.set(true);
      },
    });
  }

  public refresh(): void {
    this._loaded.set(false);
    this._currenciesApi.currenciesControllerFindAllV1().subscribe({
      next: (data) => {
        this._currencies.set(data);
        this._loaded.set(true);
      },
    });
  }

  public getCurrencyByCode(
    code: string
  ): FindAllCurrenciesQueryResponse | undefined {
    return this._currencies().find((c) => c.code === code);
  }
}
