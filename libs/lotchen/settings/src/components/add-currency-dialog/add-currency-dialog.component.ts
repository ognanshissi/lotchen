import { Component, inject, OnInit } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  CurrenciesApiService,
  FindAllCurrenciesQueryResponse,
} from '@talisoft/api/lotchen-client-api';

export interface AddCurrencyDialogData {
  mode: 'create' | 'edit';
  currency?: FindAllCurrenciesQueryResponse;
}

@Component({
  selector: 'settings-add-currency-dialog',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    ButtonModule,
    FormField,
    TasInput,
    TasLabel,
    ReactiveFormsModule,
  ],
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title
          >{{ data.mode === 'create' ? 'Ajouter' : 'Modifier' }} une
          devise</tas-title
        >
      </tas-drawer-title>
      <tas-drawer-content>
        <form [formGroup]="form">
          <div class="flex flex-col space-y-4">
            <tas-form-field>
              <tas-label>Code ISO 4217</tas-label>
              <input
                tasInput
                type="text"
                formControlName="code"
                placeholder="Ex: XOF"
                style="text-transform: uppercase"
              />
            </tas-form-field>
            <tas-form-field>
              <tas-label>Taux de change</tas-label>
              <input
                tasInput
                type="number"
                formControlName="rate"
                placeholder="Ex: 1.00"
                step="0.01"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Nom</tas-label>
              <input
                tasInput
                type="text"
                formControlName="name"
                placeholder="Ex: Franc CFA"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Symbole</tas-label>
              <input
                tasInput
                type="text"
                formControlName="symbol"
                placeholder="Ex: FCFA"
              />
            </tas-form-field>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                formControlName="isDefault"
                class="w-4 h-4"
              />
              <span class="text-sm">Devise par défaut</span>
            </label>
          </div>
        </form>
      </tas-drawer-content>

      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
        <button tas-raised-button color="primary" (click)="handleSubmit()">
          <tas-icon iconName="feather:check"></tas-icon>
          Sauvegarder
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class AddCurrencyDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddCurrencyDialogData = inject(DIALOG_DATA);
  private readonly _currenciesApiService = inject(CurrenciesApiService);

  public form!: FormGroup;

  public ngOnInit(): void {
    const c = this.data.currency;
    this.form = new FormGroup({
      code: new FormControl(c?.code ?? '', [Validators.required]),
      name: new FormControl(c?.name ?? '', [Validators.required]),
      symbol: new FormControl(c?.symbol ?? '', [Validators.required]),
      rate: new FormControl(c?.rate ?? 1, [
        Validators.required,
        Validators.min(1),
      ]),
      isDefault: new FormControl(c?.isDefault ?? false),
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    payload.code = payload.code.toUpperCase();

    if (this.data.mode === 'edit' && this.data.currency) {
      this._currenciesApiService
        .currenciesControllerUpdateV1(this.data.currency.id, payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Devise modifiée');
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de modifier la devise');
          },
        });
    } else {
      this._currenciesApiService
        .currenciesControllerCreateV1(payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Devise créée');
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de créer la devise');
          },
        });
    }
  }
}
