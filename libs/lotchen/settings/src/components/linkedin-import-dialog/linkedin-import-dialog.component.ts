import { Component, inject, signal } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { HttpClient } from '@angular/common/http';
import { LeadCaptureConfigsApiService } from '@talisoft/api/lotchen-client-api';

export interface LinkedInImportDialogData {
  configId: string;
  configName: string;
}

interface Commenter {
  firstName: string;
  lastName: string;
  profileUrl: string;
  headline: string;
}

@Component({
  selector: 'settings-linkedin-import-dialog',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    TasText,
    ButtonModule,
    FormField,
    TasInput,
    TasLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './linkedin-import-dialog.component.html',
})
export class LinkedInImportDialogComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: LinkedInImportDialogData = inject(DIALOG_DATA);
  private readonly _leadCaptureConfigsApi = inject(
    LeadCaptureConfigsApiService
  );

  public postUrlControl = new FormControl('');
  public commenters = signal<Commenter[]>([
    { firstName: '', lastName: '', profileUrl: '', headline: '' },
  ]);
  public importing = signal(false);

  public addCommenter(): void {
    this.commenters.update((list) => [
      ...list,
      { firstName: '', lastName: '', profileUrl: '', headline: '' },
    ]);
  }

  public removeCommenter(index: number): void {
    this.commenters.update((list) => list.filter((_, i) => i !== index));
  }

  public updateCommenter(
    index: number,
    field: keyof Commenter,
    value: string
  ): void {
    this.commenters.update((list) =>
      list.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  public handleImport(): void {
    const postUrl = this.postUrlControl.value?.trim();
    if (!postUrl) {
      this._snackbar.error('Erreur', "Veuillez saisir l'URL du post");
      return;
    }

    const validCommenters = this.commenters().filter(
      (c) => c.firstName && c.lastName && c.profileUrl
    );

    if (validCommenters.length === 0) {
      this._snackbar.error(
        'Erreur',
        'Ajoutez au moins un commentateur avec prénom, nom et URL profil'
      );
      return;
    }

    this.importing.set(true);

    this._leadCaptureConfigsApi
      .captureConfigControllerImportLinkedInPostV1(this.data.configId, {
        postUrl,
        commenters: validCommenters,
      })
      .subscribe({
        next: (res) => {
          this.importing.set(false);
          this._snackbar.success(
            'Importation terminée',
            `${res.imported} importé(s), ${res.skipped} ignoré(s)`
          );
          this._dialogRef.close(true);
        },
        error: () => {
          this.importing.set(false);
          this._snackbar.error('Erreur', "Échec de l'importation");
        },
      });
  }
}
