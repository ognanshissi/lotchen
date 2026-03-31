import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { TasCheckbox } from '@talisoft/ui/checkbox';
import { TasDatePicker } from '@talisoft/ui/date-picker';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { DynamicFormsApiService } from 'libs/shared/api/lotchen-client-api/src/lib/api/api';
import { FindByClassNameFieldDto } from 'libs/shared/api/lotchen-client-api/src/lib/model/models';

export interface DynamicFieldDefinition {
  _id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  visible: boolean;
  custom: boolean;
  position: number;
  placeholder?: string;
  hint?: string;
  options?: string[];
}

interface FormDefinition {
  id: string;
  formClass: string;
  name: string;
  isActive: boolean;
  fields: DynamicFieldDefinition[];
}

@Component({
  selector: 'lotchen-dynamic-fields',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormField,
    TasLabel,
    TasInput,
    TasSelect,
    TasCheckbox,
    TasDatePicker,
    TasCard,
    TasCardHeader,
    TasTitle,
  ],
  template: `
    @if (visibleFields().length > 0) {
    <tas-card>
      <card-header>
        <tas-title>{{ sectionTitle() }}</tas-title>
      </card-header>

      <div class="p-4 flex flex-col gap-3">
        <form [formGroup]="dynamicForm">
          @for (field of visibleFields(); track field.id) {
          <div class="mb-3">
            @switch (field.type) { @case ('checkbox') {
            <tas-checkbox [formControlName]="field.name">
              {{ field.label }}
            </tas-checkbox>
            } @case ('dropdown') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <tas-select
                [formControlName]="field.name"
                [options]="getSelectOptions(field)"
                [placeholder]="field.placeholder || 'Sélectionner...'"
                [searchable]="false"
              ></tas-select>
            </tas-form-field>
            } @case ('radio') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <tas-select
                [formControlName]="field.name"
                [options]="getSelectOptions(field)"
                [placeholder]="field.placeholder || 'Sélectionner...'"
                [searchable]="false"
              ></tas-select>
            </tas-form-field>
            } @case ('date') {
            <tas-date-picker
              [formControlName]="field.name"
              [placeholder]="field.placeholder || ''"
            >
              {{ field.label }}
            </tas-date-picker>
            } @case ('datetime') {
            <tas-date-picker
              [formControlName]="field.name"
              mode="datetime"
              [placeholder]="field.placeholder || ''"
            >
              {{ field.label }}
            </tas-date-picker>
            } @case ('time') {
            <tas-date-picker
              [formControlName]="field.name"
              mode="time"
              [placeholder]="field.placeholder || ''"
            >
              {{ field.label }}
            </tas-date-picker>
            } @case ('textarea') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <textarea
                tasInput
                [formControlName]="field.name"
                class="w-full border rounded px-3 py-2 text-sm"
                rows="3"
                [placeholder]="field.placeholder || ''"
              ></textarea>
            </tas-form-field>
            } @case ('number') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <input
                tasInput
                type="number"
                [formControlName]="field.name"
                [placeholder]="field.placeholder || ''"
              />
            </tas-form-field>
            } @case ('email') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <input
                tasInput
                type="email"
                [formControlName]="field.name"
                [placeholder]="field.placeholder || ''"
              />
            </tas-form-field>
            } @case ('currency') {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <input
                tasInput
                type="number"
                [formControlName]="field.name"
                [placeholder]="field.placeholder || ''"
                step="0.01"
              />
            </tas-form-field>
            } @default {
            <tas-form-field>
              <tas-label>{{ field.label }}</tas-label>
              <input
                tasInput
                type="text"
                [formControlName]="field.name"
                [placeholder]="field.placeholder || ''"
              />
            </tas-form-field>
            } } @if (field.hint) {
            <p class="text-xs text-gray-400 mt-1">{{ field.hint }}</p>
            }
          </div>
          }
        </form>
      </div>
    </tas-card>
    }
  `,
})
export class DynamicFieldsComponent implements OnInit {
  private readonly _dynamicFormsApiService = inject(DynamicFormsApiService);

  public formClass = input.required<string>();
  public initialValues = input<Record<string, string>>({});
  public sectionTitle = input<string>('Champs personnalisés');

  public valuesChanged = output<Record<string, string>>();

  public dynamicForm = new FormGroup({});
  public fields = signal<FindByClassNameFieldDto[]>([]);

  public visibleFields = computed(() =>
    this.fields()
      .filter((f) => f.visible && f.custom)
      .sort((a, b) => a.position - b.position)
  );

  private _initialized = false;

  constructor() {
    effect(() => {
      const fields = this.visibleFields();
      if (fields.length && !this._initialized) {
        this._initialized = true;
        this._buildForm(fields);
      }
    });
  }

  public ngOnInit(): void {
    this._loadFormDefinition();
  }

  public getValues(): Record<string, string> {
    const result: Record<string, string> = {};
    const raw = this.dynamicForm.getRawValue();
    for (const [key, value] of Object.entries(raw)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = String(value);
      }
    }
    return result;
  }

  public getSelectOptions(
    field: FindByClassNameFieldDto
  ): { label: string; value: string }[] {
    return (field.options || []).map((o) => ({ label: o, value: o }));
  }

  private _loadFormDefinition(): void {
    this._dynamicFormsApiService
      .formControllerFindByClassNameV1(this.formClass())
      .subscribe({
        next: (form) => {
          if (!form) {
            // this._snackbar.error('Erreur', 'Formulaire introuvable');
            return;
          }
          this.fields.set(form.fields);
        },
      });
  }

  private _buildForm(fields: FindByClassNameFieldDto[]): void {
    const values = this.initialValues();
    for (const field of fields) {
      const initialValue = values[field.name] ?? null;
      this.dynamicForm.addControl(field.name, new FormControl(initialValue));
    }

    this.dynamicForm.valueChanges.subscribe(() => {
      this.valuesChanged.emit(this.getValues());
    });
  }
}
