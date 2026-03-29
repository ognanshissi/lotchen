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
import {
  ProductResponse,
  PolicyResponse,
} from '../../containers/products/products.interfaces';
import { PoliciesApiService } from '@talisoft/api/lotchen-client-api';

export interface AddPolicyDialogData {
  mode: 'create' | 'edit';
  products: ProductResponse[];
  policy?: PolicyResponse;
}

@Component({
  selector: 'settings-add-policy-dialog',
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
          >{{ data.mode === 'create' ? 'Ajouter' : 'Modifier' }} une
          police</tas-title
        >
      </tas-drawer-title>
      <tas-drawer-content>
        <form [formGroup]="form">
          <div class="flex flex-col space-y-4">
            @if (data.mode === 'create') {
            <tas-form-field>
              <tas-label>Produit</tas-label>
              <select
                formControlName="productId"
                class="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un produit</option>
                @for (product of data.products; track product.id) {
                <option [value]="product.id">{{ product.name }}</option>
                }
              </select>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Contact ID</tas-label>
              <input
                tasInput
                type="text"
                formControlName="contactId"
                placeholder="Identifiant du contact"
              />
            </tas-form-field>
            }

            <tas-form-field>
              <tas-label>Date de début</tas-label>
              <input tasInput type="date" formControlName="startDate" />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Date de fin</tas-label>
              <input tasInput type="date" formControlName="endDate" />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Montant de la prime</tas-label>
              <input
                tasInput
                type="number"
                formControlName="premiumAmount"
                placeholder="Montant"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Fréquence de paiement</tas-label>
              <select
                formControlName="paymentFrequency"
                class="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Sélectionner</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="semi_annual">Semestriel</option>
                <option value="annual">Annuel</option>
              </select>
            </tas-form-field>

            @if (data.mode === 'edit') {
            <tas-form-field>
              <tas-label>Statut</tas-label>
              <select
                formControlName="status"
                class="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="quote">Devis</option>
                <option value="application">Demande</option>
                <option value="underwriting">Souscription</option>
                <option value="active">Active</option>
                <option value="renewal">Renouvellement</option>
                <option value="lapsed">Expirée</option>
              </select>
            </tas-form-field>
            }

            <tas-form-field>
              <tas-label>Notes</tas-label>
              <textarea
                formControlName="notes"
                class="w-full border rounded px-3 py-2 text-sm"
                rows="3"
                placeholder="Notes additionnelles"
              ></textarea>
            </tas-form-field>
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
export class AddPolicyDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddPolicyDialogData = inject(DIALOG_DATA);
  private readonly _policiesApiService = inject(PoliciesApiService);

  public form!: FormGroup;

  public ngOnInit(): void {
    const p = this.data.policy;
    this.form = new FormGroup({
      productId: new FormControl(p?.productId ?? '', [Validators.required]),
      contactId: new FormControl(p?.contactId ?? '', [Validators.required]),
      startDate: new FormControl(
        p?.startDate ? this.formatDate(p.startDate) : ''
      ),
      endDate: new FormControl(p?.endDate ? this.formatDate(p.endDate) : ''),
      premiumAmount: new FormControl(p?.premiumAmount ?? null),
      paymentFrequency: new FormControl(p?.paymentFrequency ?? ''),
      status: new FormControl(p?.status ?? 'quote'),
      notes: new FormControl(''),
    });
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();

    // Remove empty values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    if (this.data.mode === 'edit' && this.data.policy) {
      delete payload.productId;
      delete payload.contactId;
      this._policiesApiService
        .policyControllerUpdateV1(this.data.policy.id, payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Police modifiée');
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de modifier la police');
          },
        });
    } else {
      this._policiesApiService.policyControllerCreateV1(payload).subscribe({
        next: () => {
          this._dialogRef.close(true);
          this._snackbar.success('Succès', 'Police créée');
        },
        error: (err: { error?: { message?: string } }) => {
          this._snackbar.error(
            'Erreur',
            err?.error?.message || 'Impossible de créer la police'
          );
        },
      });
    }
  }
}
