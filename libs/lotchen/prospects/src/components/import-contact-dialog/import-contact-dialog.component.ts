import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

export interface ContactPreviewRow {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  jobTitle: string;
  valid: boolean;
  observation: string;
}

type DialogStep = 'upload' | 'review';

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
  public step = signal<DialogStep>('upload');
  public selectedFile = signal<File | null>(null);
  public parsedContacts = signal<ContactPreviewRow[]>([]);
  public parseError = signal<string | null>(null);

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

      const contacts: ContactPreviewRow[] = rows.map((row) => {
        const firstName = String(row['First name'] ?? '').trim();
        const lastName = String(row['Last name'] ?? '').trim();
        const email = String(row['Email'] ?? '').trim();
        const mobile = String(row['Mobile'] ?? '').trim();
        const jobTitle = String(row['Job title'] ?? '').trim();
        const valid = !!(firstName || lastName) && !!(email || mobile);
        return {
          firstName,
          lastName,
          email,
          mobile,
          jobTitle,
          valid,
          observation: '',
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
    const validContacts = this.parsedContacts().filter((c) => c.valid);
    // import valid contacts here
    console.log('Importing valid contacts:', validContacts);
  }

  public downloadTemplate(): void {
    const link = document.createElement('a');
    link.href = 'path/to/your/template.xlsx';
    link.download = 'contact_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
