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
import { TasSelect } from '@talisoft/ui/select';
import { TasCheckbox } from '@talisoft/ui/checkbox';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { DynamicFormsApiService } from 'libs/shared/api/lotchen-client-api/src/lib/api/api';
import {
  AddFieldCommand,
  AddFieldCommandTypeEnum,
} from '@talisoft/api/lotchen-client-api';

export interface AddFieldDialogData {
  mode: 'create' | 'edit';
  formId: string;
  field?: {
    _id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    visible: boolean;
    custom: boolean;
    placeholder?: string;
    hint?: string;
    options?: string[];
  };
}

const TYPES_WITH_OPTIONS = ['dropdown', 'radio', 'autocomplete', 'tags'];

@Component({
  selector: 'settings-add-field-dialog',
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
    TasCheckbox,
  ],
  templateUrl: './add-field-dialog.component.html',
})
export class AddFieldDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddFieldDialogData = inject(DIALOG_DATA);
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);

  public form!: FormGroup;
  public showOptions = signal(false);

  public typeList = [
    { label: 'Texte', value: 'text' },
    { label: 'Zone de texte', value: 'textarea' },
    { label: 'Nombre', value: 'number' },
    { label: 'Email', value: 'email' },
    { label: 'Téléphone', value: 'phone' },
    { label: 'URL', value: 'url' },
    { label: 'Date', value: 'date' },
    { label: 'Date et heure', value: 'datetime' },
    { label: 'Heure', value: 'time' },
    { label: 'Liste déroulante', value: 'dropdown' },
    { label: 'Bouton radio', value: 'radio' },
    { label: 'Case à cocher', value: 'checkbox' },
    { label: 'Autocomplétion', value: 'autocomplete' },
    { label: 'Tags', value: 'tags' },
    { label: 'Monnaie', value: 'currency' },
    { label: 'Note', value: 'rating' },
    { label: 'Couleur', value: 'color' },
    { label: 'Fichier', value: 'file' },
    { label: 'Image', value: 'image' },
  ];

  public ngOnInit(): void {
    const f = this.data.field;
    this.form = new FormGroup({
      name: new FormControl(
        { value: f?.name ?? '', disabled: this.data.mode === 'edit' },
        [Validators.required]
      ),
      label: new FormControl(f?.label ?? '', [Validators.required]),
      type: new FormControl(
        {
          value: f?.type ?? 'text',
          disabled: this.data.mode === 'edit' && !f?.custom,
        },
        [Validators.required]
      ),
      required: new FormControl(f?.required ?? false),
      visible: new FormControl(f?.visible ?? true),
      placeholder: new FormControl(f?.placeholder ?? ''),
      hint: new FormControl(f?.hint ?? ''),
      optionsText: new FormControl(f?.options?.join('\n') ?? ''),
    });

    this.showOptions.set(TYPES_WITH_OPTIONS.includes(f?.type ?? 'text'));

    this.form.get('type')?.valueChanges.subscribe((type: string) => {
      this.showOptions.set(TYPES_WITH_OPTIONS.includes(type));
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: AddFieldCommand = {
      name: raw.name,
      type: AddFieldCommandTypeEnum.Text,
      label: raw.label,
      required: raw.required,
      visible: raw.visible,
      placeholder: raw.placeholder || undefined,
      hint: raw.hint || undefined,
    };

    if (this.showOptions()) {
      payload['options'] = raw.optionsText
        ? raw.optionsText
            .split('\n')
            .map((o: string) => o.trim())
            .filter((o: string) => o)
        : [];
    }

    if (this.data.mode === 'edit' && this.data.field) {
      this._dynamicFormsApiService
        .formControllerUpdateFieldV1(this.data.formId, this.data.field._id)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Champ modifié');
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de modifier le champ');
          },
        });
    } else {
      payload['name'] = raw.name;
      payload['type'] = raw.type;
      this._dynamicFormsApiService
        .formControllerAddFieldV1(this.data.formId, {
          ...payload,
        } as AddFieldCommand)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Champ ajouté');
          },
          error: () => {
            this._snackbar.error('Erreur', "Impossible d'ajouter le champ");
          },
        });
    }
  }
}
