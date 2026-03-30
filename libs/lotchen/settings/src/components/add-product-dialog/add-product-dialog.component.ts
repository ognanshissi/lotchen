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
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ProductResponse } from '../../containers/products/products.interfaces';
import { ProductsApiService } from '@talisoft/api/lotchen-client-api';
import { TasSelect } from '@talisoft/ui/select';

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
    TasSelect,
  ],
  templateUrl: './add-product-dialog.component.html',
})
export class AddProductDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddProductDialogData = inject(DIALOG_DATA);
  private readonly _productsApiService = inject(ProductsApiService);

  public form!: FormGroup;

  public typeList = signal([
    { label: 'Prêt', value: 'loan' },
    { label: 'Assurance', value: 'insurance' },
    { label: 'Epargne', value: 'savings' },
  ]);

  public insuranceTypelist = signal([
    { label: 'Vie', value: 'life' },
    { label: 'Santé', value: 'health' },
    { label: 'Biens', value: 'property' },
  ]);

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
      this._productsApiService
        .productControllerUpdateV1(this.data.product.id, payload)
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
      this._productsApiService.productControllerCreateV1(payload).subscribe({
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
