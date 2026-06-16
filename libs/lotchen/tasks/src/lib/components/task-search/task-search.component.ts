import { Component, OnDestroy, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface TaskFilterData {
  searchTerm?: string;
  taskType?: string | null;
  completed?: boolean | null;
}

@Component({
  selector: 'tasks-task-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TasCard,
    TasIcon,
    TasInput,
    TasSelect,
    FormField,
    TasLabel,
  ],
  template: `
    <tas-card class="mt-4 p-4">
      <div class="flex items-center gap-2 mb-2">
        <tas-icon
          iconName="feather:filter"
          iconClass="text-gray-500"
        ></tas-icon>
        <span class="font-medium text-sm text-gray-700">Filtres</span>
        <button
          class="ml-auto text-sm text-primary cursor-pointer"
          (click)="clearFilters()"
        >
          Réinitialiser
        </button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <tas-form-field>
          <tas-label>Recherche</tas-label>
          <input
            tasInput
            type="text"
            placeholder="Titre, description..."
            [formControl]="searchControl"
          />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Type de tâche</tas-label>
          <tas-select
            [options]="taskTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les types"
            [formControl]="taskTypeFilter"
          ></tas-select>
        </tas-form-field>

        <tas-form-field>
          <tas-label>Statut</tas-label>
          <tas-select
            [options]="completionOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les statuts"
            [formControl]="completionFilter"
          ></tas-select>
        </tas-form-field>
      </div>
    </tas-card>
  `,
})
export class TaskSearchComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  public filterChange = output<TaskFilterData>();

  public searchControl = new FormControl<string>('');
  public taskTypeFilter = new FormControl<string | null>(null);
  public completionFilter = new FormControl<string | null>(null);

  public taskTypeOptions = [
    { label: 'Suivi', value: 'follow up' },
    { label: 'Rappel appel', value: 'call reminder' },
    { label: 'Autre', value: 'other' },
  ];

  public completionOptions = [
    { label: 'En attente', value: 'pending' },
    { label: 'Completée', value: 'completed' },
  ];

  public ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => this.filterChange.emit(this._getFilterValues()));

    [this.taskTypeFilter, this.completionFilter].forEach((ctrl) =>
      ctrl.valueChanges
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.filterChange.emit(this._getFilterValues()))
    );
  }

  public clearFilters(): void {
    this.searchControl.reset('');
    this.taskTypeFilter.reset(null);
    this.completionFilter.reset(null);
    this.filterChange.emit(this._getFilterValues());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _getFilterValues(): TaskFilterData {
    const completion = this.completionFilter.value;
    return {
      searchTerm: this.searchControl.value ?? '',
      taskType: this.taskTypeFilter.value,
      completed:
        completion === 'completed'
          ? true
          : completion === 'pending'
          ? false
          : null,
    };
  }
}
