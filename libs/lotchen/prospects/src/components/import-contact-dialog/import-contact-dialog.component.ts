import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import * as XLSX from 'xlsx';
import { ButtonModule } from '@talisoft/ui/button';
import { TasFileUploader } from '@talisoft/ui/file-uploader';
import { TasIcon } from '@talisoft/ui/icon';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ContactsService } from '@lotchen/lotchen/common/services';
import { ImportSummary } from '@lotchen/lotchen/common/models';
import { ContactPreviewRow } from './contact-preview.model';

type DialogStep = 'upload' | 'review' | 'summary';

@Component({
  selector: 'prospects-import-contact-dialog',
  templateUrl: './import-contact-dialog.component.html',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    ButtonModule,
    TasTitle,
    TasFileUploader,
    FormsModule,
  ],
})
export class ImportContactDialogComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _contactsService = inject(ContactsService);

  public step = signal<DialogStep>('upload');
  public selectedFile = signal<File | null>(null);
  public parsedContacts = signal<ContactPreviewRow[]>([]);
  public parseError = signal<string | null>(null);
  public importing = signal(false);
  public importResult = signal<ImportSummary | null>(null);

  public validCount = computed(
    () => this.parsedContacts().filter((c) => c.valid).length
  );
  public invalidCount = computed(
    () => this.parsedContacts().filter((c) => !c.valid).length
  );

  public onFileChange(file: File | null): void {
    this.selectedFile.set(file);
    this.parsedContacts.set([]);
    this.parseError.set(null);
  }

  public async review(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
        defval: '',
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const contacts: ContactPreviewRow[] = rows.map((row) => {
        const firstName = String(row['First name'] ?? '').trim();
        const lastName = String(row['Last name'] ?? '').trim();
        const email = String(row['Email'] ?? '').trim();
        const mobile = String(row['Mobile'] ?? '').trim();
        const jobTitle = String(row['Job title'] ?? '').trim();

        const hasName = !!(firstName || lastName);
        const hasContact = !!(email || mobile);
        const emailValid = !email || emailRegex.test(email);
        const valid = hasName && hasContact && emailValid;

        let observation = '';
        if (!hasName) {
          observation = 'Prénom ou nom requis';
        } else if (!hasContact) {
          observation = 'Email ou mobile requis';
        } else if (!emailValid) {
          observation = 'Format email invalide';
        }

        return {
          firstName,
          lastName,
          email,
          mobile,
          jobTitle,
          valid,
          observation,
        };
      });

      if (contacts.length === 0) {
        this.parseError.set('Le fichier ne contient aucune ligne de données.');
        return;
      }

      this.parsedContacts.set(contacts);
      this.step.set('review');
    } catch {
      this.parseError.set(
        "Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier Excel valide."
      );
    }
  }

  public back(): void {
    this.step.set('upload');
  }

  public importContacts(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.importing.set(true);

    const formData = new FormData();
    formData.append('file', file);

    this._contactsService.importContacts(formData).subscribe({
      next: (result) => {
        this.importing.set(false);
        this.importResult.set(result);
        this.step.set('summary');
        this._snackbar.success(
          'Import terminé',
          `${result.createdCount} contact(s) créé(s)`
        );
      },
      error: () => {
        this.importing.set(false);
        this._snackbar.error('Erreur', "Impossible d'importer les contacts");
      },
    });
  }

  public closeDrawer(): void {
    const result = this.importResult();
    this._dialogRef.close(result?.createdCount ? 'imported' : undefined);
  }

  public downloadTemplate(): void {
    const headers = ['First name', 'Last name', 'Email', 'Mobile', 'Job title'];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, 'contact_import_template.xlsx');
  }
}
