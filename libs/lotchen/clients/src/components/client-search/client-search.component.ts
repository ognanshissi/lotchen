import { Component, OnDestroy, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface ClientFilterData {
  searchTerm?: string;
  accountType?: string | null;
  status?: string | null;
  createdAtFrom?: string | null;
}

@Component({
  selector: 'clients-client-search',
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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <tas-form-field>
          <tas-label>Recherche</tas-label>
          <input
            tasInput
            type="text"
            placeholder="Nom, email, téléphone, N° client..."
            [formControl]="searchControl"
          />
        </tas-form-field>

        <tas-form-field>
          <tas-label>Type de compte</tas-label>
          <tas-select
            [options]="accountTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les types"
            [formControl]="accountTypeFilter"
          ></tas-select>
        </tas-form-field>

        <tas-form-field>
          <tas-label>Statut</tas-label>
          <tas-select
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les statuts"
            [formControl]="statusFilter"
          ></tas-select>
        </tas-form-field>

        <tas-form-field>
          <tas-label>Période</tas-label>
          <tas-select
            [options]="periodOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Toutes les périodes"
            [formControl]="periodFilter"
          ></tas-select>
        </tas-form-field>
      </div>
    </tas-card>
  `,
})
export class ClientSearchComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();

  public filterChange = output<ClientFilterData>();

  public searchControl = new FormControl<string>('');
  public accountTypeFilter = new FormControl<string | null>(null);
  public statusFilter = new FormControl<string | null>(null);
  public periodFilter = new FormControl<string | null>(null);

  public accountTypeOptions = [
    { label: 'Individuel', value: 'Individual' },
    { label: 'Entreprise', value: 'Business' },
    { label: 'Joint', value: 'Joint' },
  ];

  public statusOptions = [
    { label: 'Actif', value: 'Active' },
    { label: 'Inactif', value: 'Inactive' },
    { label: 'Suspendu', value: 'Suspended' },
    { label: 'Fermé', value: 'Closed' },
  ];

  public periodOptions = [
    { label: '7 derniers jours', value: '7d' },
    { label: '30 derniers jours', value: '30d' },
    { label: '3 derniers mois', value: '90d' },
    { label: '6 derniers mois', value: '180d' },
    { label: 'Cette année', value: 'year' },
  ];

  public ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => this.filterChange.emit(this._getFilterValues()));

    [this.accountTypeFilter, this.statusFilter, this.periodFilter].forEach(
      (ctrl) =>
        ctrl.valueChanges
          .pipe(takeUntil(this._destroy$))
          .subscribe(() => this.filterChange.emit(this._getFilterValues()))
    );
  }

  public clearFilters(): void {
    this.searchControl.reset('');
    this.accountTypeFilter.reset(null);
    this.statusFilter.reset(null);
    this.periodFilter.reset(null);
    this.filterChange.emit(this._getFilterValues());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _getFilterValues(): ClientFilterData {
    return {
      searchTerm: this.searchControl.value ?? '',
      accountType: this.accountTypeFilter.value,
      status: this.statusFilter.value,
      createdAtFrom: this._periodToDate(this.periodFilter.value),
    };
  }

  private _periodToDate(period: string | null): string | null {
    if (!period) return null;
    const now = new Date();
    if (period === 'year') {
      return new Date(now.getFullYear(), 0, 1).toISOString();
    }
    const days = parseInt(period, 10);
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    console.log(date);
    return date.toISOString();
  }
}
