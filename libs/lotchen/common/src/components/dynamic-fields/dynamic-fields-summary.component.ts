import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TasSummaryField } from '@talisoft/ui/summary-field';
import { SnackbarService } from '@talisoft/ui/snackbar/src/public_api';
import { DynamicFormsApiService } from 'libs/shared/api/lotchen-client-api/src/lib/api/api';
import { FindByClassNameFieldDto } from 'libs/shared/api/lotchen-client-api/src/lib/model/models';

@Component({
  selector: 'lotchen-dynamic-fields-summary',
  standalone: true,
  imports: [TasSummaryField],
  template: `
    @for (field of visibleFields(); track field.id) {
    <tas-summary-field
      [rawField]="field.name"
      [label]="field.label"
      [editable]="true"
      [type]="mapFieldType(field.type)"
      [value]="getFieldValue(field.name)"
      [options]="optionsListFormatter(field)"
      (fieldSaved)="onFieldSaved($event, field.name)"
    />
    }
  `,
})
export class DynamicFieldsSummaryComponent implements OnInit {
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);
  private readonly _snackbar = inject(SnackbarService);

  public formClass = input.required<string>();
  public customFields = input<Record<string, string>>({});

  public fieldSaved = output<{ field: string; value: string }>();

  public visibleFields = signal<FindByClassNameFieldDto[]>([]);

  public ngOnInit(): void {
    this._loadFormDefinition();
  }

  public getFieldValue(fieldName: string): string {
    return this.customFields()?.[fieldName] ?? '—';
  }

  public optionsListFormatter(
    field: FindByClassNameFieldDto
  ): { label: string; value: string }[] {
    return (field.options ?? [])?.map((option) => ({
      label: option,
      value: option,
    }));
  }

  public mapFieldType(type: string): any {
    switch (type) {
      case 'number':
      case 'currency':
        return 'number';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime';
      case 'dropdown':
        return 'dropdown';
      default:
        return 'text';
    }
  }

  public onFieldSaved(
    event: { field: string; value: any },
    fieldName: string
  ): void {
    this.fieldSaved.emit({
      field: fieldName,
      value: String(event.value),
    });
  }

  private _loadFormDefinition(): void {
    this._dynamicFormsApiService
      .formControllerFindByClassNameV1(this.formClass())
      .subscribe({
        next: (form) => {
          if (!form) {
            this._snackbar.error('Erreur', 'Formulaire introuvable');
            return;
          }
          this.visibleFields.set(
            form.fields
              .filter((f) => f.visible && f.custom)
              .sort((a, b) => a.position - b.position)
          );
        },
      });
  }
}
