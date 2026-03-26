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
import { HttpClient } from '@angular/common/http';
import { CaptureConfigItem } from '../../containers/lead-capture/lead-capture-settings.component';

export interface AddCaptureConfigDialogData {
  mode: 'create' | 'edit';
  config?: CaptureConfigItem;
}

@Component({
  selector: 'settings-add-capture-config-dialog',
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
          intégration</tas-title
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
                placeholder="Ex: Mon site web"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Plateforme</tas-label>
              <select
                formControlName="platform"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="website">Site web</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="google-forms">Google Forms</option>
              </select>
            </tas-form-field>

            @if (form.get('platform')?.value === 'website') {
            <tas-form-field>
              <tas-label
                >Domaines autorisés (séparés par des virgules)</tas-label
              >
              <input
                tasInput
                type="text"
                formControlName="allowedDomains"
                placeholder="https://example.com, https://other.com"
              />
            </tas-form-field>
            }

            <tas-form-field>
              <tas-label>Type de routage</tas-label>
              <select
                formControlName="routingType"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Aucun</option>
                <option value="fixed">Assignation fixe</option>
                <option value="round-robin">Round-robin</option>
              </select>
            </tas-form-field>

            @if (form.get('routingType')?.value === 'fixed') {
            <tas-form-field>
              <tas-label>ID Utilisateur assigné</tas-label>
              <input
                tasInput
                type="text"
                formControlName="assignToUserId"
                placeholder="UUID de l'utilisateur"
              />
            </tas-form-field>
            } @if (form.get('routingType')?.value === 'round-robin') {
            <tas-form-field>
              <tas-label>ID Équipe</tas-label>
              <input
                tasInput
                type="text"
                formControlName="assignToTeamId"
                placeholder="UUID de l'équipe"
              />
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
export class AddCaptureConfigDialogComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddCaptureConfigDialogData = inject(DIALOG_DATA);

  public form!: FormGroup;

  public ngOnInit(): void {
    const c = this.data.config;
    this.form = new FormGroup({
      name: new FormControl(c?.name ?? '', [Validators.required]),
      platform: new FormControl(c?.platform ?? 'website'),
      allowedDomains: new FormControl(c?.allowedDomains?.join(', ') ?? ''),
      routingType: new FormControl(c?.routingRule?.type ?? ''),
      assignToUserId: new FormControl(c?.routingRule?.assignToUserId ?? ''),
      assignToTeamId: new FormControl(c?.routingRule?.assignToTeamId ?? ''),
    });
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const payload: any = {
      name: v.name,
      platform: v.platform,
      allowedDomains: v.allowedDomains
        ? v.allowedDomains
            .split(',')
            .map((d: string) => d.trim())
            .filter((d: string) => d)
        : [],
    };

    if (v.routingType) {
      payload.routingRule = {
        type: v.routingType,
        assignToUserId: v.assignToUserId || null,
        assignToTeamId: v.assignToTeamId || null,
      };
    }

    if (this.data.mode === 'edit' && this.data.config) {
      this._http
        .patch(`/api/v1/lead-capture-configs/${this.data.config.id}`, payload)
        .subscribe({
          next: () => {
            this._dialogRef.close(true);
            this._snackbar.success('Succès', 'Intégration modifiée');
          },
          error: () => {
            this._snackbar.error(
              'Erreur',
              "Impossible de modifier l'intégration"
            );
          },
        });
    } else {
      this._http.post('/api/v1/lead-capture-configs', payload).subscribe({
        next: () => {
          this._dialogRef.close(true);
          this._snackbar.success('Succès', 'Intégration créée');
        },
        error: () => {
          this._snackbar.error('Erreur', "Impossible de créer l'intégration");
        },
      });
    }
  }
}
