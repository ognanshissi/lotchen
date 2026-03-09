import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { finalize } from 'rxjs';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasCard } from '@talisoft/ui/card';
import {
  ConvertLeadCommandRequestConvertToEnum,
  LeadsApiService,
} from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'leads-convert-dialog',
  standalone: true,
  imports: [ButtonModule, TasIcon, TasCard],
  template: `
    <tas-card class="w-[450px] p-6">
      <h2 class="text-xl font-semibold mb-4">Convertir le lead</h2>
      <p class="text-gray-500 text-sm mb-6">
        Choisissez le type de conversion pour ce lead.
      </p>

      <div class="flex flex-col gap-3 mb-6">
        <button
          class="p-4 border rounded-lg text-left transition-colors cursor-pointer"
          [class.border-primary]="selectedOption() === 'prospect'"
          [class.bg-primary]="selectedOption() === 'prospect'"
          [class.text-white]="selectedOption() === 'prospect'"
          [class.border-gray-300]="selectedOption() !== 'prospect'"
          (click)="selectedOption.set('prospect')"
        >
          <div class="font-semibold">Convertir en Prospect</div>
          <div
            class="text-sm"
            [class.text-white]="selectedOption() === 'prospect'"
            [class.text-gray-500]="selectedOption() !== 'prospect'"
          >
            Le lead sera transformé en prospect pour un suivi commercial
            approfondi.
          </div>
        </button>

        <button
          class="p-4 border rounded-lg text-left transition-colors cursor-pointer"
          [class.border-primary]="selectedOption() === 'client'"
          [class.bg-primary]="selectedOption() === 'client'"
          [class.text-white]="selectedOption() === 'client'"
          [class.border-gray-300]="selectedOption() !== 'client'"
          (click)="selectedOption.set('client')"
        >
          <div class="font-semibold">Convertir en Client</div>
          <div
            class="text-sm"
            [class.text-white]="selectedOption() === 'client'"
            [class.text-gray-500]="selectedOption() !== 'client'"
          >
            Le lead sera directement converti en client actif.
          </div>
        </button>
      </div>

      <div class="flex justify-end gap-2">
        <button
          tas-outlined-button
          (click)="close()"
          [disabled]="isSubmitting()"
        >
          Annuler
        </button>
        <button
          tas-raised-button
          color="primary"
          [disabled]="!selectedOption()"
          (click)="submit()"
          [isLoading]="isSubmitting()"
        >
          <tas-icon iconName="feather:refresh-cw"></tas-icon>
          Convertir
        </button>
      </div>
    </tas-card>
  `,
})
export class ConvertLeadDialogComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _data = inject(DIALOG_DATA) as { leadId: string };
  private readonly _snackbar = inject(SnackbarService);
  private readonly _leadsApiService = inject(LeadsApiService);

  public selectedOption = signal<'prospect' | 'client' | null>(null);
  public isSubmitting = signal(false);

  submit() {
    const convertTo = this.selectedOption();
    if (!convertTo) return;

    this.isSubmitting.set(true);

    this._leadsApiService
      .leadsControllerConvertLeadV1(this._data.leadId, {
        convertTo: convertTo as ConvertLeadCommandRequestConvertToEnum,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this._snackbar.success(
            'Succès',
            `Lead converti en ${
              convertTo === 'prospect' ? 'prospect' : 'client'
            } avec succès`
          );
          this._dialogRef.close(convertTo);
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de convertir le lead');
        },
      });
  }

  close() {
    this._dialogRef.close();
  }
}
