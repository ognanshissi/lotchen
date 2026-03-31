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
import { TasSelect } from '@talisoft/ui/select';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { DynamicFormsApiService } from '@talisoft/api/lotchen-client-api';

export interface AddFormDialogData {
  mode: 'create';
}

@Component({
  selector: 'settings-add-form-dialog',
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
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Nouveau formulaire</tas-title>
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
                placeholder="Ex: Formulaire contact principal"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Entité</tas-label>
              <tas-select formControlName="formClass" [options]="formClassList">
              </tas-select>
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
          Créer
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class AddFormDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _http = inject(HttpClient);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddFormDialogData = inject(DIALOG_DATA);
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);

  public form!: FormGroup;

  public formClassList = [
    { label: 'Contact', value: 'Contact' },
    { label: 'Lead', value: 'Lead' },
    { label: 'Client', value: 'Client' },
    { label: 'Produit', value: 'Produit' },
  ];

  public ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      formClass: new FormControl('Contact', [Validators.required]),
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;

    this._dynamicFormsApiService
      .formControllerCreateV1(this.form.getRawValue())
      .subscribe({
        next: () => {
          this._dialogRef.close(true);
          this._snackbar.success('Succès', 'Formulaire créé');
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de créer le formulaire');
        },
      });
  }
}
