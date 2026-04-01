import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { QuickAddLeadComponent } from '../../components/quick-add-lead/quick-add-lead.component';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import {
  RowSelectionItem,
  RowSelectionMaster,
  TasTable,
  TableConfig,
} from '@talisoft/ui/table';
import { PageEvent } from '@angular/material/paginator';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { RouterLink } from '@angular/router';
import { CallerService } from '@lotchen/lotchen/common/components/caller/caller.service';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TasSelect } from '@talisoft/ui/select';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { QualifyLeadDialogComponent } from '../../components/qualify-lead-dialog/qualify-lead-dialog.component';
import { ConvertLeadDialogComponent } from '../../components/convert-lead-dialog/convert-lead-dialog.component';
import {
  LeadsApiService,
  PaginateAllLeadsCommandDto,
} from '@talisoft/api/lotchen-client-api';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';

interface LeadDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  status: string;
  source: string;
  priority: string | null;
  productInterest: string | null;
  estimatedValue: number | null;
  assignedToUserId: string | null;
  score: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'leads-lead-listing',
  standalone: true,
  templateUrl: './lead-listing.component.html',
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
    TasSelect,
    FormField,
    TasLabel,
    TasInput,
    NgClass,
  ],
})
export class LeadListingComponent implements OnInit {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _callerService = inject(CallerService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _leadsApiService = inject(LeadsApiService);
  private readonly _confirmDialogService = inject(ConfirmDialogService);

  public pageIndex = signal(0);
  public pageSize = signal(10);
  public totalElements = signal(0);

  public leads = signal<PaginateAllLeadsCommandDto[]>([]);
  public isLoading = signal(false);
  public selectedItems = signal<PaginateAllLeadsCommandDto[]>([]);

  public searchControl = new FormControl('');
  public statusFilter = new FormControl(null);
  public sourceFilter = new FormControl(null);
  public priorityFilter = new FormControl(null);

  public statusOptions = [
    { label: 'Nouveau', value: 'New' },
    { label: 'Contacté', value: 'Contacted' },
    { label: 'Intéressé', value: 'Interested' },
    { label: 'Qualifié', value: 'Qualified' },
    { label: 'Disqualifié', value: 'Disqualified' },
  ];

  public sourceOptions = [
    { label: 'Website', value: 'Website' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Back Office', value: 'Back Office' },
    { label: 'Other', value: 'Other' },
  ];

  public priorityOptions = [
    { label: 'Basse', value: 'Low' },
    { label: 'Moyenne', value: 'Medium' },
    { label: 'Haute', value: 'High' },
    { label: 'Critique', value: 'Critical' },
  ];

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
    this.loadLeads();
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLeads();
  }

  public onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadLeads();
  }

  public loadLeads(): void {
    this.isLoading.set(true);

    const filters: any = {};

    const statusVal = this.statusFilter.value;
    if (statusVal) {
      filters.status = {
        operator: 'in',
        value: Array.isArray(statusVal) ? statusVal : [statusVal],
      };
    }

    const sourceVal = this.sourceFilter.value;
    if (sourceVal) {
      filters.source = {
        operator: 'in',
        value: Array.isArray(sourceVal) ? sourceVal : [sourceVal],
      };
    }

    const priorityVal = this.priorityFilter.value;
    if (priorityVal) {
      filters.priority = {
        operator: 'in',
        value: Array.isArray(priorityVal) ? priorityVal : [priorityVal],
      };
    }

    const body = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      filters,
      fullTextSearch: this.searchControl.value || '',
    };

    this._leadsApiService
      .leadsControllerPaginateAllLeadsV1('', body)
      .subscribe({
        next: (response) => {
          this.leads.set(response.data ?? []);
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
          this._snackbar.error('Erreur', 'Impossible de charger les leads');
        },
      });
  }

  public openCaller(item: LeadDto): void {
    this._callerService.openCaller({
      id: item.id,
      clientName: `${item.firstName} ${item.lastName?.toUpperCase()}`,
      mobileNumber: item.mobileNumber ?? '',
    });
  }

  public handleSelectionItems(event: unknown[]): void {
    this.selectedItems.set(event as PaginateAllLeadsCommandDto[]);
  }

  public openQuickAdd(): void {
    this._sideDrawerService
      .open(QuickAddLeadComponent, {
        width: '800px',
      })
      .closed.subscribe(() => {
        this.loadLeads();
      });
  }

  public qualifyLead(item: LeadDto): void {
    const dialogRef = this._dialog.open(QualifyLeadDialogComponent, {
      data: { leadId: item.id },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'qualified') {
        this.loadLeads();
      }
    });
  }

  public convertLead(item: LeadDto): void {
    const dialogRef = this._dialog.open(ConvertLeadDialogComponent, {
      data: { leadId: item.id },
    });
    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.loadLeads();
      }
    });
  }

  public deleteLead(item: LeadDto): void {
    this._confirmDialogService.confirm({
      title: 'Supprimer le lead',
      showCancelButton: true,
      acceptButtonProps: {
        label: 'Oui, Supprimer le lead',
        icon: 'delete',
      },
      message: `Êtes-vous sûr de vouloir supprimer ${item.firstName} ${item.lastName} ?`,
      closable: true,
      accept: () => {
        this._leadsApiService.leadsControllerDeleteLeadV1(item.id).subscribe({
          next: () => {
            this._snackbar.success('Succès', 'Lead supprimé avec succès');
            this.loadLeads();
          },
          error: () => {
            this._snackbar.error('Erreur', 'Impossible de supprimer le lead');
          },
        });
      },
    });
  }

  public getPriorityClass(priority: string | null): string {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}

export default LeadListingComponent;
