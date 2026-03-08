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
import { TasSelect } from '@talisoft/ui/select';
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
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasDatePicker } from '@talisoft/ui/date-picker';

@Component({
  selector: 'prospects-quick-add',
  templateUrl: './quick-add.component.html',
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
    TasSelect,
    ReactiveFormsModule,
    TasCard,
    TasCardHeader,
    TasDatePicker,
  ],
  standalone: true,
})
export class QuickAddComponent implements OnInit {
  private readonly _contactApiService = inject(ContactsApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);
  public genderOptions = [
    { label: 'Homme', value: 'Male' },
    { label: 'Femme', value: 'Female' },
  ];
  public sourceOptions = [
    { label: 'Back Office', value: 'Back Office' },
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'Event', value: 'Event' },
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Email', value: 'Email' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Other', value: 'Other' },
  ];
  public form!: FormGroup;

  public ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      mobileNumber: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      jobTitle: new FormControl(null),
      dateOfBirth: new FormControl(null),
      gender: new FormControl(null),
      source: new FormControl(null),
      company: new FormControl(null),
      phone: new FormControl(null),
      street: new FormControl(null),
      city: new FormControl(null),
      postalCode: new FormControl(null),
      country: new FormControl(null),
      tags: new FormControl(null),
    });
  }

  public submit() {
    this.form.disable();
    const formValue = this.form.getRawValue();

    const { street, city, postalCode, country, tags, ...rest } = formValue;
    const payload: any = { ...rest };

    if (street || city || postalCode || country) {
      payload.address = { street, city, postalCode, country };
    }

    if (tags) {
      payload.tags = tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    this._contactApiService
      .contactsControllerCreateContactV1(payload)
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
