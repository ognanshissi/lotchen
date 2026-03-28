import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ProductResponse } from '../../containers/products/products.interfaces';

export interface AddProductDialogData {
  mode: 'create' | 'edit';
  defaultType?: string;
  product?: ProductResponse;
}

@Component({
  selector: 'settings-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
          >{{ data.mode === 'create' ? 'Ajouter' : 'Modifier' }} un
          produit</tas-title
        >
      </tas-drawer-title>
      <tas-drawer-content>
        <form [formGroup]="form">
          <div class="flex flex-col space-y-4">
            <tas-form-field>
              <tas-label>Nom</tas-label>
              <input
                tasInput
                type="text"
                formControlName="name"
                placeholder="Nom du produit"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Type</tas-label>
              <select
                formControlName="type"
                class="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="loan">Prêt</option>
                <option value="savings">Épargne</option>
                <option value="insurance">Assurance</option>
              </select>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Description</tas-label>
              <textarea
                formControlName="description"
                class="w-full border rounded px-3 py-2 text-sm"
                rows="3"
                placeholder="Description du produit"
              ></textarea>
            </tas-form-field>

            <!-- Financial fields -->
            @if (form.get('type')?.value === 'loan' || form.get('type')?.value
            === 'savings') {
            <tas-form-field>
              <tas-label>Taux d'intérêt (%)</tas-label>
              <input
                tasInput
                type="number"
                formControlName="interestRate"
                placeholder="Ex: 5.5"
                step="0.1"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Durée (mois)</tas-label>
              <input
                tasInput
                type="number"
                formControlName="duration"
                placeholder="Ex: 12"
              />
            </tas-form-field>
            }

            <!-- Insurance fields -->
            @if (form.get('type')?.value === 'insurance') {
            <tas-form-field>
              <tas-label>Type d'assurance</tas-label>
              <select
                formControlName="insuranceType"
                class="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Sélectionner</option>
                <option value="life">Vie</option>
                <option value="health">Santé</option>
                <option value="property">Biens</option>
              </select>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Couverture</tas-label>
              <textarea
                formControlName="coverage"
                class="w-full border rounded px-3 py-2 text-sm"
                rows="2"
                placeholder="Description de la couverture"
              ></textarea>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Franchise</tas-label>
              <input
                tasInput
                type="number"
                formControlName="deductible"
                placeholder="Montant de la franchise"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Conditions</tas-label>
              <textarea
                formControlName="terms"
                class="w-full border rounded px-3 py-2 text-sm"
                rows="3"
                placeholder="Conditions de la police"
              ></textarea>
            </tas-form-field>
            }
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
export class AddProductDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddProductDialogData = inject(DIALOG_DATA);
  private readonly _http = inject(HttpClient);

  public form!: FormGroup;

  public ngOnInit(): void {
    const p = this.data.product;
    this.form = new FormGroup({
      name: new FormControl(p?.name ?? '', [Validators.required]),
      type: new FormControl(p?.type ?? this.data.defaultType ?? 'loan', [
        Validators.required,
      ]),
      description: new FormControl(p?.description ?? ''),
      interestRate: new FormControl(p?.interestRate ?? null),
      duration: new FormControl(p?.duration ?? null),
      insuranceType: new FormControl(p?.insuranceType ?? ''),
      coverage: new FormControl(p?.coverage ?? ''),
      deductible: new FormControl(p?.deductible ?? null),
      terms: new FormControl(''),
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();

    // Clean up unrelated fields
    if (payload.type !== 'insurance') {
      delete payload.insuranceType;
      delete payload.coverage;
      delete payload.deductible;
      delete payload.terms;
    } else {
      delete payload.interestRate;
      delete payload.duration;
    }

    // Remove null/empty values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    if (this.data.mode === 'edit' && this.data.product) {
      this._http
        .patch(`/api/v1/products/${this.data.product.id}`, payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Produit modifié');
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de modifier le produit');
          },
        });
    } else {
      this._http.post('/api/v1/products', payload).subscribe({
        next: () => {
          this._dialogRef.close(true);
          this._snackbar.success('Succès', 'Produit créé');
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de créer le produit');
        },
      });
    }
  }
}
