import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import {
  LeadsApiService,
  ConvertLeadCommandRequestConvertToEnum,
} from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { Router } from '@angular/router';
import { TasSpinner } from '@talisoft/ui/spinner';

export interface ConvertClientDialogData {
  contactId: string;
}

@Component({
  selector: 'lotchen-convert-client-dialog',
  templateUrl: './convert-client-dialog.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    TasDrawerAction,
    TasSideDrawer,
    TasDrawerTitle,
    TasTitle,
    TasDrawerContent,
    TasSpinner,
  ],
})
export class ConvertClientDialogComponent {
  private readonly _data = inject(DIALOG_DATA) as ConvertClientDialogData;
  private readonly _dialogRef = inject(DialogRef);
  private readonly _leadsApi = inject(LeadsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _router = inject(Router);

  public isConverting = signal(false);

  public convert(): void {
    this.isConverting.set(true);
    this._leadsApi
      .leadsControllerConvertLeadV1(this._data.contactId, {
        convertTo: ConvertLeadCommandRequestConvertToEnum.Client,
      })
      .subscribe({
        next: () => {
          this._snackbar.success(
            'Succès',
            'Le contact a été converti en client'
          );
          this.isConverting.set(false);
          this._dialogRef.close();
          this._router.navigate(['/portal/clients']);
        },
        error: () => {
          this._snackbar.error('Erreur', 'La conversion a échoué');
          this.isConverting.set(false);
        },
      });
  }

  public close(): void {
    this._dialogRef.close();
  }
}
