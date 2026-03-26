import { Component, inject, OnInit, signal } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasText } from '@talisoft/ui/text';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { HttpClient } from '@angular/common/http';
import { AddCurrencyDialogComponent } from '../../components/add-currency-dialog/add-currency-dialog.component';
import {
  CurrenciesApiService,
  FindAllCurrenciesQueryResponse,
} from '@talisoft/api/lotchen-client-api';

export interface CurrencyResponse {
  id: string;
  code: string;
  name: string;
  rate: number;
  symbol: string;
  isDefault: boolean;
  isActive: boolean;
}

@Component({
  selector: 'settings-currency',
  standalone: true,
  imports: [TasTitle, TasText, TasCard, TasIcon, ButtonModule],
  template: `
    <div class="py-8 px-6 bg-white">
      <div class="flex justify-between items-center">
        <div>
          <tas-title>Devises</tas-title>
          <tas-text
            >Configurer les devises utilisées dans l'application</tas-text
          >
        </div>
        <button tas-raised-button color="primary" (click)="openAddDialog()">
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter une devise
        </button>
      </div>
    </div>

    <div class="p-6">
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Code
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">Nom</th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Symbole
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Taux de change
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Par défaut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (currency of currencies(); track currency.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ currency.code }}</td>
              <td class="py-3 px-4">{{ currency.name }}</td>
              <td class="py-3 px-4">{{ currency.symbol }}</td>
              <td class="py-3 px-4">{{ '' }}</td>
              <td class="py-3 px-4">
                @if (currency.isDefault) {
                <span
                  class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >Par défaut</span
                >
                }
              </td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditDialog(currency)"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
                @if (!currency.isDefault) {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="setDefault(currency)"
                >
                  <tas-icon iconName="feather:star"></tas-icon>
                </button>
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-red-500"
                  (click)="deleteCurrency(currency)"
                >
                  <tas-icon iconName="feather:trash-2"></tas-icon>
                </button>
                }
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
    </div>
  `,
})
export class CurrencySettingsComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _currenciesApiService = inject(CurrenciesApiService);

  public currencies = signal<FindAllCurrenciesQueryResponse[]>([]);

  public ngOnInit(): void {
    this.loadCurrencies();
  }

  public loadCurrencies(): void {
    this._currenciesApiService.currenciesControllerFindAllV1().subscribe({
      next: (data) => this.currencies.set(data),
    });
  }

  public openAddDialog(): void {
    const ref = this._dialog.open(AddCurrencyDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadCurrencies();
    });
  }

  public openEditDialog(currency: FindAllCurrenciesQueryResponse): void {
    const ref = this._dialog.open(AddCurrencyDialogComponent, {
      width: '600px',
      data: { mode: 'edit', currency },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadCurrencies();
    });
  }

  public setDefault(currency: FindAllCurrenciesQueryResponse): void {
    this._currenciesApiService
      .currenciesControllerSetDefaultV1(currency.id)
      .subscribe({
        next: () => {
          this._snackbar.success(
            'Succès',
            `${currency.code} définie comme devise par défaut`
          );
          this.loadCurrencies();
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Impossible de définir la devise par défaut'
          );
        },
      });
  }

  public deleteCurrency(currency: FindAllCurrenciesQueryResponse): void {
    if (!confirm(`Supprimer la devise "${currency.name}" ?`)) return;
    this._currenciesApiService
      .currenciesControllerDeleteV1(currency.id)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Devise supprimée');
          this.loadCurrencies();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de supprimer la devise');
        },
      });
  }
}

export default CurrencySettingsComponent;
