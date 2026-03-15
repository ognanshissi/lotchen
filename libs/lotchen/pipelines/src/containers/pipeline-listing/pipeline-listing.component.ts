import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SalesPipelinesApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';
import { ConfirmationService } from 'primeng/api';
import { switchMap } from 'rxjs';

@Component({
  selector: 'pipelines-listing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pipeline-listing.component.html',
  imports: [
    DatePipe,
    TasCard,
    TasCardHeader,
    TasTitle,
    TasText,
    ButtonModule,
    TasIcon,
    TasSpinner,
    Menu,
    MenuItem,
    TasMenuTrigger,
  ],
  providers: [ConfirmationService],
})
export class PipelineListingComponent implements OnInit {
  private readonly _pipelinesApi = inject(SalesPipelinesApiService);
  private readonly _router = inject(Router);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmationService = inject(ConfirmationService);

  pipelines = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadPipelines();
  }

  loadPipelines(): void {
    this.isLoading.set(true);
    this._pipelinesApi.salesPipelinesControllerFindAllV1().subscribe({
      next: (data) => {
        this.pipelines.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          'Erreur lors du chargement des pipelines'
        );
        this.isLoading.set(false);
      },
    });
  }

  create(): void {
    this._router.navigate(['/portal/pipelines/create']);
  }

  edit(id: string): void {
    this._router.navigate([`/portal/pipelines/${id}/edit`]);
  }

  board(id: string): void {
    this._router.navigate([`/portal/pipelines/${id}/board`]);
  }

  analytics(id: string): void {
    this._router.navigate([`/portal/pipelines/${id}/analytics`]);
  }

  setDefault(id: string): void {
    this._pipelinesApi.salesPipelinesControllerSetDefaultV1(id).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Pipeline défini par défaut');
        this.loadPipelines();
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors de la mise à jour');
      },
    });
  }

  delete(id: string): void {
    this._confirmationService
      .confirm({
        message: 'Voulez-vous vraiment supprimer ce pipeline ?',
      })
      .accept.pipe(
        switchMap(() => this._pipelinesApi.salesPipelinesControllerDeleteV1(id))
      )
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Pipeline supprimé');
          this.loadPipelines();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Erreur lors de la suppression');
        },
      });
  }
}

export default PipelineListingComponent;
