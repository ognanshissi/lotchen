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
  EventTypesApiService,
  FindAllEventTypesQueryResponse,
} from '@talisoft/api/lotchen-client-api';

export interface AddEventTypeDialogData {
  mode: 'create' | 'edit';
  eventType?: FindAllEventTypesQueryResponse;
}

@Component({
  selector: 'settings-add-event-type-dialog',
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
          >{{ data.mode === 'create' ? 'Ajouter' : 'Modifier' }} un type
          d'événement</tas-title
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
                placeholder="Ex: Réunion"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Icône (feather)</tas-label>
              <input
                tasInput
                type="text"
                formControlName="icon"
                placeholder="feather:calendar"
              />
            </tas-form-field>

            @if (form.get('icon')?.value) {
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <tas-icon [iconName]="form.get('icon')?.value"></tas-icon>
              Aperçu
            </div>
            }

            <tas-form-field>
              <tas-label>Couleur</tas-label>
              <input
                type="color"
                formControlName="color"
                class="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Durée par défaut (minutes)</tas-label>
              <input
                tasInput
                type="number"
                formControlName="defaultDurationMinutes"
                placeholder="30"
              />
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
export class AddEventTypeDialogComponent implements OnInit {
  private readonly _eventTypesApi = inject(EventTypesApiService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddEventTypeDialogData = inject(DIALOG_DATA);

  public form!: FormGroup;

  public ngOnInit(): void {
    const et = this.data.eventType;
    this.form = new FormGroup({
      name: new FormControl(et?.name ?? '', [Validators.required]),
      icon: new FormControl(et?.icon ?? 'feather:calendar'),
      color: new FormControl(et?.color ?? '#6366f1'),
      defaultDurationMinutes: new FormControl(et?.defaultDurationMinutes ?? 30),
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();

    if (this.data.mode === 'edit' && this.data.eventType) {
      this._eventTypesApi
        .eventTypesControllerUpdateEventTypeV1(this.data.eventType.id, payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', "Type d'événement modifié");
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de modifier le type');
          },
        });
    } else {
      this._eventTypesApi
        .eventTypesControllerCreateEventTypeV1(payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', "Type d'événement créé");
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de créer le type');
          },
        });
    }
  }
}
