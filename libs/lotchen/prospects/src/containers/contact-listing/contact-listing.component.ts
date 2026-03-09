import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { QuickAddComponent } from '../../components/quick-add/quick-add.component';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import {
  RowSelectionItem,
  RowSelectionMaster,
  TasTable,
  TableConfig,
} from '@talisoft/ui/table';
import { PageEvent } from '@angular/material/paginator';
import {
  ContactsApiService,
  PaginateAllContactsCommandDto,
  PaginateAllContactsCommandRequest,
  TerritoriesApiService,
  TeamsApiService,
  UsersApiService,
  ContactsControllerPaginateAllTerritoriesV1200Response,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { RouterLink } from '@angular/router';
import { ImportContactDialogComponent } from '../../components/import-contact-dialog/import-contact-dialog.component';
import { CallerService } from '@lotchen/lotchen/common/components/caller/caller.service';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';
import { AddTaskDialogService } from '@lotchen/lotchen/common/components/add-task-dialog';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { TasSelect } from '@talisoft/ui/select';
import { TasMultiSelect } from '@talisoft/ui/multi-select';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasDatePicker } from '@talisoft/ui/date-picker';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ReassignContactDialogComponent } from '../../components/reassign-contact-dialog/reassign-contact-dialog.component';

@Component({
  selector: 'prospects-contact-listing',
  standalone: true,
  templateUrl: './contact-listing.component.html',
  imports: [
    TasTitle,
    ButtonModule,
    TasIcon,
    TasText,
    TasCard,
    TasCardHeader,
    TasTable,
    RowSelectionMaster,
    RowSelectionItem,
    TimeagoPipe,
    RouterLink,
    Menu,
    TasMenuTrigger,
    MenuItem,
    TasSelect,
    TasMultiSelect,
    FormField,
    TasLabel,
    TasInput,
    TasDatePicker,
    ReactiveFormsModule,
  ],
})
export class ContactListingComponent implements OnInit, OnDestroy {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _contactsApiService = inject(ContactsApiService);
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _teamsApiService = inject(TeamsApiService);
  private readonly _usersApiService = inject(UsersApiService);
  private readonly _callerService = inject(CallerService);
  private readonly _addTaskDialogService = inject(AddTaskDialogService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _destroy$ = new Subject<void>();

  // Filter form controls
  public statusFilter = new FormControl<string[]>([]);
  public sourceFilter = new FormControl<string[]>([]);
  public territoryFilter = new FormControl<string | null>(null);
  public teamFilter = new FormControl<string | null>(null);
  public agentFilter = new FormControl<string | null>(null);
  public dateRangeFilter = new FormControl<string | null>(null);
  public searchControl = new FormControl<string>('');

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

  // Pagination state
  public pageIndex = signal(0);
  public pageSize = signal(10);
  public totalElements = signal(0);

  // Data
  public contacts = signal<PaginateAllContactsCommandDto[]>([]);
  public isLoading = signal(false);
  public selectedItems = signal<PaginateAllContactsCommandDto[]>([]);

  public tableConfig: TableConfig = {
    property: 'id',
    pagination: {
      serverSide: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [5, 10, 30, 50],
      totalElements: 0,
    },
  };

  public ngOnInit(): void {
    this.loadContacts();

    // Debounced search
    this.searchControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this._destroy$))
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadContacts();
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

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public onFiltersChange(): void {
    this.pageIndex.set(0);
    this.loadContacts();
  }

  public onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadContacts();
  }

  public onSearchChange(searchTerm: string): void {
    this.searchControl.setValue(searchTerm);
  }

  public loadContacts(): void {
    this.isLoading.set(true);

    const filters: any = {};

    const statusVal = this.statusFilter.value;
    if (statusVal && statusVal.length > 0) {
      filters.status = { operator: 'in', value: statusVal };
    }

    const sourceVal = this.sourceFilter.value;
    if (sourceVal && sourceVal.length > 0) {
      filters.source = { operator: 'in', value: sourceVal };
    }

    const territoryVal = this.territoryFilter.value;
    if (territoryVal) {
      filters.territoryId = { operator: 'eq', value: territoryVal };
    }

    const teamVal = this.teamFilter.value;
    if (teamVal) {
      filters.assignedToTeamId = { operator: 'eq', value: teamVal };
    }

    const agentVal = this.agentFilter.value;
    if (agentVal) {
      filters.assignedToUserId = { operator: 'eq', value: agentVal };
    }

    const request: PaginateAllContactsCommandRequest = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      filters,
      fullTextSearch: this.searchControl.value || '',
    };

    this._contactsApiService
      .contactsControllerPaginateAllTerritoriesV1('', request)
      .subscribe({
        next: (
          response: ContactsControllerPaginateAllTerritoriesV1200Response
        ) => {
          this.contacts.set(response.data ?? []);
          this.totalElements.set(response.totalElements ?? 0);
          this.tableConfig = {
            ...this.tableConfig,
            pagination: {
              ...this.tableConfig.pagination,
              pageIndex: response.pageIndex,
              pageSize: response.pageSize,
              totalElements: response.totalElements,
            },
          };
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this._snackbar.error('Erreur', 'Impossible de charger les contacts');
        },
      });
  }

  public openCaller(item: PaginateAllContactsCommandDto): void {
    this._callerService.openCaller({
      id: item.id!,
      clientName: `${item.firstName} ${item.lastName?.toUpperCase()}`,
      mobileNumber: item.mobileNumber ?? '',
    });
  }

  public handleSelectionItems(event: unknown[]): void {
    this.selectedItems.set(event as PaginateAllContactsCommandDto[]);
  }

  public openQuickAdd(): void {
    this._sideDrawerService.open(QuickAddComponent).closed.subscribe(() => {
      this.loadContacts();
    });
  }

  public openImportContactDialog(): void {
    this._sideDrawerService
      .open(ImportContactDialogComponent)
      .closed.subscribe((result) => {
        if (result === 'imported') {
          this.loadContacts();
        }
      });
  }

  public openAddTask(contactId: string): void {
    this._addTaskDialogService.open({
      relatedId: contactId,
      relatedType: 'Contact',
    });
  }

  public deleteContact(item: PaginateAllContactsCommandDto): void {
    const dialogRef = this._dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Supprimer le contact',
        message: `Êtes-vous sûr de vouloir supprimer ${item.firstName} ${item.lastName} ? Cette action est irréversible.`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this._contactsApiService
          .contactsControllerDeleteContactV1(item.id!)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Contact supprimé avec succès');
              this.loadContacts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer le contact'
              );
            },
          });
      }
    });
  }

  public bulkDeleteContacts(): void {
    const items = this.selectedItems();
    const dialogRef = this._dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Supprimer les contacts',
        message: `Êtes-vous sûr de vouloir supprimer ${items.length} contact(s) ? Cette action est irréversible.`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        const ids = items.map((i) => i.id!);
        this._contactsApiService
          .contactsControllerBulkDeleteContactsV1({ ids })
          .subscribe({
            next: () => {
              this._snackbar.success(
                'Succès',
                `${items.length} contact(s) supprimé(s) avec succès`
              );
              this.selectedItems.set([]);
              this.loadContacts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer les contacts'
              );
            },
          });
      }
    });
  }

  public bulkReassignContacts(): void {
    const items = this.selectedItems();
    const ref = this._sideDrawerService.open(ReassignContactDialogComponent, {
      data: { contactIds: items.map((i) => i.id!) },
    });

    ref.closed.subscribe((result) => {
      if (result === 'reassigned') {
        this.selectedItems.set([]);
        this.loadContacts();
      }
    });
  }

  public clearFilters(): void {
    this.statusFilter.reset([]);
    this.sourceFilter.reset([]);
    this.territoryFilter.reset(null);
    this.teamFilter.reset(null);
    this.agentFilter.reset(null);
    this.dateRangeFilter.reset(null);
    this.searchControl.reset('');
    this.pageIndex.set(0);
    this.loadContacts();
  }
}

export default ContactListingComponent;
