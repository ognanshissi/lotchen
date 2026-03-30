import { Component, inject, OnInit, signal } from '@angular/core';
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
import { CaptureConfigItem } from '../../containers/lead-capture/lead-capture-settings.component';
import { LeadCaptureConfigsApiService } from '@talisoft/api/lotchen-client-api';
import { TasSelect } from '@talisoft/ui/select';

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
    TasSelect,
  ],
  templateUrl: './add-capture-config-dialog.component.html',
})
export class AddCaptureConfigDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: AddCaptureConfigDialogData = inject(DIALOG_DATA);
  private readonly _leadCaptureConfigApiService = inject(
    LeadCaptureConfigsApiService
  );

  public platformOptions = signal([
    { label: 'Site web', value: 'website' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Google Forms', value: 'google-forms' },
  ]);

  public routingTypeOptions = signal([
    { label: 'Aucun', value: '' },
    { label: 'Assignation fixe', value: 'fixed' },
    { label: 'Round-robin', value: 'round-robin' },
  ]);

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
      this._leadCaptureConfigApiService
        .captureConfigControllerUpdateV1(this.data.config.id, payload)
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
      this._leadCaptureConfigApiService
        .captureConfigControllerCreateV1(payload)
        .subscribe({
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
