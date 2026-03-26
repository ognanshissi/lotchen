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
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Importer depuis LinkedIn — {{ data.configName }}</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <div class="flex flex-col space-y-4">
          <tas-form-field>
            <tas-label>URL du post LinkedIn</tas-label>
            <input
              tasInput
              type="text"
              [formControl]="postUrlControl"
              placeholder="https://www.linkedin.com/posts/..."
            />
          </tas-form-field>

          <div>
            <div class="flex justify-between items-center mb-2">
              <tas-text class="font-semibold">Commentateurs</tas-text>
              <button
                tas-outlined-button
                class="!text-sm"
                (click)="addCommenter()"
              >
                <tas-icon iconName="feather:plus"></tas-icon>
                Ajouter
              </button>
            </div>

            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-2 px-2">Prénom</th>
                  <th class="py-2 px-2">Nom</th>
                  <th class="py-2 px-2">URL Profil</th>
                  <th class="py-2 px-2">Titre</th>
                  <th class="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                @for ( commenter of commenters(); track $index; let i = $index )
                {
                <tr class="border-b border-gray-100">
                  <td class="py-1 px-1">
                    <input
                      class="w-full border rounded px-2 py-1 text-sm"
                      [value]="commenter.firstName"
                      (input)="
                        updateCommenter(
                          i,
                          'firstName',
                          $any($event.target).value
                        )
                      "
                      placeholder="Prénom"
                    />
                  </td>
                  <td class="py-1 px-1">
                    <input
                      class="w-full border rounded px-2 py-1 text-sm"
                      [value]="commenter.lastName"
                      (input)="
                        updateCommenter(
                          i,
                          'lastName',
                          $any($event.target).value
                        )
                      "
                      placeholder="Nom"
                    />
                  </td>
                  <td class="py-1 px-1">
                    <input
                      class="w-full border rounded px-2 py-1 text-sm"
                      [value]="commenter.profileUrl"
                      (input)="
                        updateCommenter(
                          i,
                          'profileUrl',
                          $any($event.target).value
                        )
                      "
                      placeholder="https://linkedin.com/in/..."
                    />
                  </td>
                  <td class="py-1 px-1">
                    <input
                      class="w-full border rounded px-2 py-1 text-sm"
                      [value]="commenter.headline"
                      (input)="
                        updateCommenter(
                          i,
                          'headline',
                          $any($event.target).value
                        )
                      "
                      placeholder="Titre"
                    />
                  </td>
                  <td class="py-1 px-1">
                    <button
                      class="text-red-500 hover:text-red-700"
                      (click)="removeCommenter(i)"
                    >
                      <tas-icon iconName="feather:x"></tas-icon>
                    </button>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </tas-drawer-content>
      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
        <button
          tas-raised-button
          color="primary"
          (click)="handleImport()"
          [disabled]="importing()"
        >
          <tas-icon iconName="feather:download"></tas-icon>
          {{ importing() ? 'Importation...' : 'Importer' }}
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class LinkedInImportDialogComponent {
  private readonly _http = inject(HttpClient);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: LinkedInImportDialogData = inject(DIALOG_DATA);

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

    this._http
      .post<{ imported: number; skipped: number }>(
        `/api/v1/lead-capture-configs/${this.data.configId}/import-linkedin-post`,
        { postUrl, commenters: validCommenters }
      )
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
