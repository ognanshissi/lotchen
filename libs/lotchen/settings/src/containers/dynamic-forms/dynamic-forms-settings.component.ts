import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { AddFormDialogComponent } from '../../components/add-field-dialog/add-form-dialog.component';
import { DynamicFormsApiService } from 'libs/shared/api/lotchen-client-api/src/lib/api/api';

export interface FormListItem {
  id: string;
  formClass: string;
  name: string;
  isActive: boolean;
  fieldCount: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'settings-dynamic-forms',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TasTitle,
    TasText,
    TasCard,
    TasIcon,
    ButtonModule,
  ],
  templateUrl: './dynamic-forms-settings.component.html',
})
export class DynamicFormsSettingsComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);

  public forms = signal<FormListItem[]>([]);

  public ngOnInit(): void {
    this.loadForms();
  }

  public loadForms(): void {
    this._dynamicFormsApiService.formControllerFindAllV1().subscribe({
      next: (data) => this.forms.set(data),
      error: () =>
        this._snackbar.error('Erreur', 'Impossible de charger les formulaires'),
    });
  }

  public getFormClassLabel(formClass: string): string {
    const labels: Record<string, string> = {
      contact: 'Contact',
      lead: 'Lead',
      client: 'Client',
      product: 'Produit',
    };
    return labels[formClass] || formClass;
  }

  public openCreateFormDialog(): void {
    const ref = this._dialog.open(AddFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadForms();
    });
  }
}

export default DynamicFormsSettingsComponent;
