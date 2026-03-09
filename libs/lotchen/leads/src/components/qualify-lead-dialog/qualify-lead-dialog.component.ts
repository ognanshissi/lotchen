import { Component, inject, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { finalize } from 'rxjs';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasCard } from '@talisoft/ui/card';
import { LeadsApiService } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'leads-qualify-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TasIcon,
    FormField,
    TasLabel,
    TasInput,
    TasCard,
  ],
  template: `
    <tas-card class="w-[500px] p-6">
      <h2 class="text-xl font-semibold mb-4">Qualification BANT</h2>
      <p class="text-gray-500 text-sm mb-4">
        Renseignez les critères de qualification du lead (Budget, Autorité,
        Besoin, Échéancier).
      </p>

      <form [formGroup]="form" class="flex flex-col gap-3">
        <tas-form-field>
          <tas-label>Budget</tas-label>
          <input
            tasInput
            type="text"
            formControlName="budget"
            placeholder="Quel est le budget disponible ?"
          />
        </tas-form-field>
        <tas-form-field>
          <tas-label>Autorité (Décideur)</tas-label>
          <input
            tasInput
            type="text"
            formControlName="authority"
            placeholder="Qui est le décideur ?"
          />
        </tas-form-field>
        <tas-form-field>
          <tas-label>Besoin</tas-label>
          <input
            tasInput
            type="text"
            formControlName="need"
            placeholder="Quel est le besoin identifié ?"
          />
        </tas-form-field>
        <tas-form-field>
          <tas-label>Échéancier</tas-label>
          <input
            tasInput
            type="text"
            formControlName="timeline"
            placeholder="Quel est le délai envisagé ?"
          />
        </tas-form-field>

        <div class="flex justify-end gap-2 mt-4">
          <button
            tas-outlined-button
            (click)="close()"
            [disabled]="isSubmitting"
          >
            Annuler
          </button>
          <button
            tas-raised-button
            color="primary"
            (click)="submit()"
            [isLoading]="isSubmitting"
          >
            <tas-icon iconName="feather:check-circle"></tas-icon>
            Qualifier
          </button>
        </div>
      </form>
    </tas-card>
  `,
})
export class QualifyLeadDialogComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _data = inject(DIALOG_DATA) as { leadId: string };
  private readonly _snackbar = inject(SnackbarService);
  private readonly _leadsApiService = inject(LeadsApiService);

  public form!: FormGroup;
  public isSubmitting = false;

  ngOnInit() {
    this.form = new FormGroup({
      budget: new FormControl(null),
      authority: new FormControl(null),
      need: new FormControl(null),
      timeline: new FormControl(null),
    });
  }

  submit() {
    this.isSubmitting = true;
    const payload = this.form.getRawValue();

    this._leadsApiService
      .leadsControllerQualifyLeadV1(this._data.leadId, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Lead qualifié avec succès');
          this._dialogRef.close('qualified');
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de qualifier le lead');
        },
      });
  }

  close() {
    this._dialogRef.close();
  }
}
