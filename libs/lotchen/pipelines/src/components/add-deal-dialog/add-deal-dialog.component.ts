import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DealsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasInput } from '@talisoft/ui/input';
import { TasSpinner } from '@talisoft/ui/spinner';
import { FormField, TasLabel } from '@talisoft/ui/form-field';

@Component({
  selector: 'add-deal-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TasIcon,
    ButtonModule,
    FormField,
    TasLabel,
    TasInput,
    TasSpinner,
  ],
  template: `
    <div
      class="bg-white rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto"
    >
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-900">Nouveau deal</h2>
        <button
          tas-button
          iconButton
          color="neutral"
          size="small"
          (click)="dialogRef.close()"
        >
          <tas-icon iconName="feather:x"></tas-icon>
        </button>
      </div>

      <div class="p-4 space-y-4">
        <tas-form-field>
          <tas-label>Titre</tas-label>
          <input tasInput type="text" [formControl]="form.controls.title" />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Montant</tas-label>
          <input tasInput type="number" [formControl]="form.controls.amount" />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Nom du contact</tas-label>
          <input
            tasInput
            type="text"
            [formControl]="form.controls.contactName"
          />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Date de clôture prévue</tas-label>
          <input
            tasInput
            type="date"
            [formControl]="form.controls.expectedCloseDate"
          />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Notes</tas-label>
          <input tasInput type="text" [formControl]="form.controls.notes" />
        </tas-form-field>
      </div>

      <div
        class="flex items-center justify-end gap-2 p-4 border-t border-gray-200"
      >
        <button
          tas-outlined-button
          color="neutral"
          size="small"
          (click)="dialogRef.close()"
        >
          Annuler
        </button>
        <button
          tas-raised-button
          color="primary"
          size="small"
          [disabled]="form.invalid || isSaving()"
          (click)="save()"
        >
          @if (isSaving()) {
          <tas-spinner></tas-spinner>
          } @else { Créer }
        </button>
      </div>
    </div>
  `,
})
export class AddDealDialogComponent {
  readonly dialogRef = inject(DialogRef);
  private readonly _data = inject(DIALOG_DATA) as {
    pipelineId: string;
    stageId?: string;
  };
  private readonly _dealsApi = inject(DealsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _fb = inject(FormBuilder);

  isSaving = signal(false);

  form = this._fb.group({
    title: ['', Validators.required],
    amount: [0],
    contactName: [''],
    expectedCloseDate: [''],
    notes: [''],
  });

  save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);

    const val = this.form.getRawValue();
    this._dealsApi
      .dealsControllerCreateV1({
        title: val.title!,
        pipelineId: this._data.pipelineId,
        stageId: this._data.stageId,
        amount: val.amount || 0,
        contactName: val.contactName || undefined,
        expectedCloseDate: val.expectedCloseDate || undefined,
        notes: val.notes || undefined,
      })
      .subscribe({
        next: (deal) => {
          this._snackbar.success('Succès', 'Deal créé');
          this.dialogRef.close(deal);
        },
        error: (err) => {
          this._snackbar.error(
            'Erreur',
            err?.error?.message || 'Erreur lors de la création'
          );
          this.isSaving.set(false);
        },
      });
  }
}
