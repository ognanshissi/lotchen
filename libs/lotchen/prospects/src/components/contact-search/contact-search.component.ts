import { Component, inject, OnDestroy, OnInit, output } from '@angular/core';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasInput } from '@talisoft/ui/input';
import { TasMultiSelect } from '@talisoft/ui/multi-select';
import { TasSelect } from '@talisoft/ui/select';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  TeamsApiService,
  TerritoriesApiService,
  UsersApiService,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';

export interface ContactFilterData {
  status?: string[];
  source?: string[];
  territory?: string | null;
  team?: string | null;
  agent?: string | null;
  dateRange?: string | null;
  searchTerm?: string;
}

@Component({
  selector: 'prospects-contact-search',
  templateUrl: './contact-search.component.html',
  standalone: true,
  imports: [
    FormField,
    FormsModule,
    TasCard,
    TasIcon,
    TasInput,
    TasLabel,
    TasMultiSelect,
    TasSelect,
    ReactiveFormsModule,
  ],
})
export class ContactSearchComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _teamsApiService = inject(TeamsApiService);
  private readonly _usersApiService = inject(UsersApiService);

  // Filter form controls
  public statusFilter = new FormControl<string[]>([]);
  public sourceFilter = new FormControl<string[]>([]);
  public territoryFilter = new FormControl<string | null>(null);
  public teamFilter = new FormControl<string | null>(null);
  public agentFilter = new FormControl<string | null>(null);
  public dateRangeFilter = new FormControl<string | null>(null);
  public searchControl = new FormControl<string>('');

  // Outputs signals
  public filterChange = output<ContactFilterData>();

  // Filter options
  public statusOptions = [
    { label: 'Nouveau', value: 'New' },
    { label: 'Contacté', value: 'Contacted' },
    { label: 'Intéressé', value: 'Interested' },
    { label: 'Qualifié', value: 'Qualified' },
    { label: 'Proposition envoyée', value: 'ProposalSent' },
    { label: 'Négociation', value: 'Negotiation' },
    { label: 'Converti en client', value: 'ConvertedToClient' },
    { label: 'Perdu', value: 'Lost' },
    { label: 'En attente', value: 'OnHold' },
  ];

  public sourceOptions = [
    { label: 'Back Office', value: 'Back Office' },
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'Event', value: 'Event' },
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Email', value: 'Email' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Other', value: 'Other' },
  ];

  // Queries
  public territories = apiResources(
    this._territoriesApiService.territoriesControllerAllTerritoriesV1(
      'id,name',
      100
    )
  );

  public teams = apiResources(
    this._teamsApiService.teamsControllerFindAllTeamsV1(undefined, 'id,name')
  );

  public users = apiResources(
    this._usersApiService.usersControllerAllUsersV1(
      undefined,
      'id,firstName,lastName'
    )
  );

  public ngOnInit(): void {
    // Debounced search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(
          () =>
            !!this.searchControl.value && this.searchControl.value.length > 2
        ),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.filterChange.emit(this._getFilterValues());
      });

    // Filter changes (non-search filters reload immediately)
    const filterControls = [
      this.statusFilter,
      this.sourceFilter,
      this.territoryFilter,
      this.teamFilter,
      this.agentFilter,
    ] as AbstractControl[];
    for (const control of filterControls) {
      control.valueChanges
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.onFiltersChange());
    }
  }

  public onFiltersChange(): void {
    this.filterChange.emit(this._getFilterValues());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _getFilterValues(): ContactFilterData {
    return {
      status: this.statusFilter.value ?? [],
      source: this.sourceFilter.value ?? [],
      territory: this.territoryFilter.value ?? null,
      team: this.teamFilter.value ?? null,
      agent: this.agentFilter.value ?? null,
      searchTerm: this.searchControl.value ?? '',
    };
  }

  public clearFilters(): void {
    this.statusFilter.reset([]);
    this.sourceFilter.reset([]);
    this.territoryFilter.reset(null);
    this.teamFilter.reset(null);
    this.agentFilter.reset(null);
    this.dateRangeFilter.reset(null);
    this.searchControl.reset('');
    this.filterChange.emit(this._getFilterValues());
  }
}
