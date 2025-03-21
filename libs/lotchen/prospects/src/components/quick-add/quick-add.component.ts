import { Component, inject, OnInit } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasText } from '@talisoft/ui/text';
import { TasInput } from '@talisoft/ui/input';
import { TasIcon } from '@talisoft/ui/icon';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { finalize } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'prospects-quick-add',
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Ajouter un contact</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. A accusamus,
          excepturi fuga fugit harum ipsum minus molestiae nobis possimus!
        </Text>

        <form [formGroup]="form" class="flex flex-col gap-3">
          <tas-form-field>
            <tas-label>Email</tas-label>
            <input
              tasInput
              formControlName="email"
              type="email"
              placeholder="Adresse électronique"
            />
          </tas-form-field>
          <tas-form-field>
            <tas-label>Nom</tas-label>
            <input
              type="text"
              formControlName="lastName"
              tasInput
              placeholder="Nom"
            />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Prénom</tas-label>
            <input
              type="text"
              formControlName="firstName"
              tasInput
              placeholder="Prénom"
            />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Numéro de téléphone</tas-label>
            <input
              tasInput
              type="text"
              formControlName="mobileNumber"
              placeholder="Numéro de téléphone"
            />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Occupation</tas-label>
            <input
              tasInput
              type="text"
              formControlName="jobTitle"
              placeholder="Occupation / Profession"
            />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Date de naissance</tas-label>
            <input
              type="date"
              formControlName="dateOfBirth"
              tasInput
              placeholder="Date de naissaince"
            />
          </tas-form-field>
        </form>
      </tas-drawer-content>
      <tas-drawer-action>
        <button tas-outlined-button closable-drawer [disabled]="form.disabled">
          <tas-icon [iconName]="'close'"></tas-icon>
          Fermer
        </button>
        <button
          tas-raised-button
          color="primary"
          [disabled]="!form.valid"
          (click)="submit()"
          [isLoading]="form.disabled"
        >
          <tas-icon iconName="check"></tas-icon>
          sauvegarder
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
  imports: [
    TasSideDrawer,
    TasTitle,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    ButtonModule,
    TasClosableDrawer,
    FormField,
    TasLabel,
    TasText,
    TasInput,
    TasIcon,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class QuickAddComponent implements OnInit {
  private readonly _contactApiService = inject(ContactsApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);
  public form!: FormGroup;

  public ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      mobileNumber: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      jobTitle: new FormControl(null),
      dateOfBirth: new FormControl(null),
    });
  }

  public submit() {
    this.form.disable();
    const formValue = this.form.getRawValue();

    this._contactApiService
      .contactsControllerCreateContactV1(formValue)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Félicitations!',
            'Le contact a été bien ajouté.'
          );
          this._dialogRef.close();
        },
        error: () => {
          this._snackbarService.error(
            'Attention!',
            "Une erreur est survenue, impossible d'ajouter le contact."
          );
        },
      });
  }
}
