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
import { ReactiveFormsModule } from '@angular/forms';
import { ReassignContactDialogComponent } from '../../components/reassign-contact-dialog/reassign-contact-dialog.component';
import {
  ContactFilterData,
  ContactSearchComponent,
} from '../../components/contact-search/contact-search.component';

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
    ReactiveFormsModule,
    ContactSearchComponent,
  ],
})
export class ContactListingComponent implements OnInit {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _contactsApiService = inject(ContactsApiService);

  private readonly _callerService = inject(CallerService);
  private readonly _addTaskDialogService = inject(AddTaskDialogService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);

  private filterData = {} as ContactFilterData;

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
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadContacts();
  }

  public onFilterChange(filterData: ContactFilterData) {
    this.filterData = filterData;
    this.loadContacts();
  }

  public loadContacts(): void {
    this.isLoading.set(true);

    const filters: any = {};

    const statusVal = this.filterData.status;
    if (statusVal && statusVal.length > 0) {
      filters.status = { operator: 'in', value: statusVal };
    }

    const sourceVal = this.filterData.source;
    if (sourceVal && sourceVal.length > 0) {
      filters.source = { operator: 'in', value: sourceVal };
    }

    const territoryVal = this.filterData.territory;
    if (territoryVal) {
      filters.territoryId = { operator: 'eq', value: territoryVal };
    }

    const teamVal = this.filterData.team;
    if (teamVal) {
      filters.assignedToTeamId = { operator: 'eq', value: teamVal };
    }

    const agentVal = this.filterData.agent;
    if (agentVal) {
      filters.assignedToUserId = { operator: 'eq', value: agentVal };
    }

    const request: PaginateAllContactsCommandRequest = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      filters,
      fullTextSearch: this.filterData.searchTerm || '',
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
}

export default ContactListingComponent;
