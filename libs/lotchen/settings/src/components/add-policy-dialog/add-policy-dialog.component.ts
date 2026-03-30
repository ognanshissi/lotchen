import { Component, inject, OnInit, signal } from '@angular/core';
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
import { TasSelect } from '@talisoft/ui/select';

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
    TasSelect,
  ],
  templateUrl: './add-policy-dialog.component.html',
})
export class AddPolicyDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddPolicyDialogData = inject(DIALOG_DATA);
  private readonly _policiesApiService = inject(PoliciesApiService);

  public form!: FormGroup;

  public paymentFrequencyOptions = signal([
    { label: 'Mensuelle', value: 'monthly' },
    { label: 'Trimestrielle', value: 'quarterly' },
    { label: 'Semestrielle', value: 'semiannually' },
    { label: 'Annuelle', value: 'annually' },
  ]);

  public statusOptions = signal([
    { label: 'Devis', value: 'quote' },
    { label: 'Demande', value: 'application' },
    { label: 'Souscription', value: 'underwriting' },
    { label: 'Active', value: 'active' },
    { label: 'Renouvellement', value: 'renewal' },
    { label: 'Expirée', value: 'lapsed' },
  ]);
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
