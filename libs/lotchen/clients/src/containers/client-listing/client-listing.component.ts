import { Component, inject, signal, OnInit } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTable, TableConfig } from '@talisoft/ui/table';
import { PageEvent } from '@angular/material/paginator';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { RouterLink } from '@angular/router';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { Severity, TasTag } from '@talisoft/ui/tag';
import { ClientsApiService } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'clients-client-listing',
  standalone: true,
  templateUrl: './client-listing.component.html',
  imports: [
    TasTitle,
    ButtonModule,
    TasText,
    TasCard,
    TasCardHeader,
    TasTable,
    TimeagoPipe,
    RouterLink,
    TasTag,
  ],
})
export class ClientListingComponent implements OnInit {
  private readonly _clientsApi = inject(ClientsApiService);
  private readonly _snackbar = inject(SnackbarService);

  public pageIndex = signal(0);
  public pageSize = signal(10);
  public totalElements = signal(0);
  public clients = signal<any[]>([]);
  public isLoading = signal(false);
  public searchTerm = '';

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

  ngOnInit(): void {
    this.loadClients();
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadClients();
  }

  public loadClients(): void {
    this.isLoading.set(true);
    this._clientsApi
      .clientControllerPaginateV1({
        pageIndex: this.pageIndex(),
        pageSize: this.pageSize(),
        filters: {},
        fullTextSearch: this.searchTerm,
      })
      .subscribe({
        next: (response) => {
          this.clients.set(response.data ?? []);
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
          this._snackbar.error('Erreur', 'Impossible de charger les clients');
        },
      });
  }

  public kycStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      NotStarted: 'Non démarré',
      InProgress: 'En cours',
      Verified: 'Vérifié',
      Rejected: 'Rejeté',
      Expired: 'Expiré',
    };
    return labels[status ?? ''] ?? status ?? '';
  }

  public kycStatusColor(status?: string): Severity {
    const colors: Record<string, Severity> = {
      Verified: 'success',
      Rejected: 'error',
      Expired: 'warning',
      InProgress: 'info',
      NotStarted: 'secondary',
    };
    return colors[status ?? ''] ?? ('secondary' as Severity);
  }

  public statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      Active: 'Actif',
      Inactive: 'Inactif',
      Suspended: 'Suspendu',
      Closed: 'Fermé',
    };
    return labels[status ?? ''] ?? status ?? '';
  }
}

export default ClientListingComponent;
