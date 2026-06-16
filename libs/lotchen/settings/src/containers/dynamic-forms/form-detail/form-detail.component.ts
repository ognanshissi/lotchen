import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';
import { AddFieldDialogComponent } from '../../../components/add-field-dialog/add-field-dialog.component';
import { of } from 'rxjs';
import { DynamicFormsApiService } from '@talisoft/api/lotchen-client-api';

export interface FieldItem {
  _id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  visible: boolean;
  custom: boolean;
  position: number;
  internal?: boolean;
  editable?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
}

export interface FormDetail {
  id: string;
  formClass: string;
  name: string;
  isActive: boolean;
  metadata?: Record<string, string>;
  fields: FieldItem[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'settings-form-detail',
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
  templateUrl: './form-detail.component.html',
})
export class FormDetailComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmDialog = inject(ConfirmDialogService);
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);

  public form = signal<any | null>(null);
  private _formId = '';

  public ngOnInit(): void {
    this._formId = this._route.snapshot.params['id'];
    this.loadForm();
  }

  public loadForm(): void {
    this._dynamicFormsApiService
      .formControllerFindByIdV1(this._formId)
      .subscribe({
        next: (data) => this.form.set(data),
        error: () =>
          this._snackbar.error('Erreur', 'Impossible de charger le formulaire'),
      });
  }

  public getFieldTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      section: 'Section',
      text: 'Texte',
      dropdown: 'Liste déroulante',
      date: 'Date',
      datetime: 'Date et heure',
      time: 'Heure',
      checkbox: 'Case à cocher',
      radio: 'Bouton radio',
      textarea: 'Zone de texte',
      number: 'Nombre',
      email: 'Email',
      phone: 'Téléphone',
      url: 'URL',
      color: 'Couleur',
      file: 'Fichier',
      image: 'Image',
      autocomplete: 'Autocomplétion',
      rating: 'Note',
      tags: 'Tags',
      currency: 'Monnaie',
      formula: 'Formule',
    };
    return labels[type] || type;
  }

  public openAddFieldDialog(): void {
    const ref = this._dialog.open(AddFieldDialogComponent, {
      width: '500px',
      data: { mode: 'create', formId: this._formId },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadForm();
    });
  }

  public openEditFieldDialog(field: FieldItem): void {
    const ref = this._dialog.open(AddFieldDialogComponent, {
      width: '500px',
      data: { mode: 'edit', formId: this._formId, field },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadForm();
    });
  }

  public toggleVisibility(field: FieldItem): void {
    // this._dynamicFormsApiService.formControllerRemoveFieldV1(this._formId, field._id, { visible: !field.visible })
    of().subscribe({
      next: () => this.loadForm(),
      error: () =>
        this._snackbar.error('Erreur', 'Impossible de modifier la visibilité'),
    });
  }

  public removeField(field: FieldItem): void {
    this._confirmDialog.confirm({
      title: `Supprimer le champ "${field.label}" ?`,
      message: 'Cette action est irréversible.',
      closable: true,
      accept: () => {
        this._dynamicFormsApiService
          .formControllerRemoveFieldV1(this._formId, field._id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Champ supprimé');
              this.loadForm();
            },
            error: (err: { error?: { message?: string } }) => {
              this._snackbar.error(
                'Erreur',
                err?.error?.message || 'Impossible de supprimer le champ'
              );
            },
          });
      },
    });
  }

  public moveField(field: FieldItem, direction: 'up' | 'down'): void {
    const fields = this.form()?.fields;
    if (!fields) return;

    const sorted = [...fields].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((f) => f._id === field._id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
    const fieldIds = sorted.map((f) => f._id);

    this._dynamicFormsApiService
      .formControllerReorderFieldsV1(this._formId, { fieldIds })
      .subscribe({
        next: () => this.loadForm(),
        error: () =>
          this._snackbar.error('Erreur', 'Impossible de réordonner les champs'),
      });
  }
}

export default FormDetailComponent;
