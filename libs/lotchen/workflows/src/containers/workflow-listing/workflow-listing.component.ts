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
import { WorkflowTemplatesApiService } from '@talisoft/api/lotchen-client-api';
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
  selector: 'workflows-listing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-listing.component.html',
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
export class WorkflowListingComponent implements OnInit {
  private readonly _workflowsApi = inject(WorkflowTemplatesApiService);
  private readonly _router = inject(Router);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmationService = inject(ConfirmationService);

  workflows = signal<any[]>([]);
  isLoading = signal(false);
  filterStatus = signal<string | undefined>(undefined);

  readonly filters = [
    { value: undefined, label: 'Tous' },
    { value: 'active', label: 'Actifs' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'archived', label: 'Archivés' },
  ];

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.isLoading.set(true);
    this._workflowsApi
      .workflowTemplatesControllerFindAllV1(this.filterStatus())
      .subscribe({
        next: (data) => {
          this.workflows.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Erreur lors du chargement des workflows'
          );
          this.isLoading.set(false);
        },
      });
  }

  setFilter(status: string | undefined): void {
    this.filterStatus.set(status);
    this.loadWorkflows();
  }

  create(): void {
    this._router.navigate(['/portal/automation-workflows/create']);
  }

  edit(id: string): void {
    this._router.navigate([`/portal/automation-workflows/${id}/edit`]);
  }

  viewExecutions(id: string): void {
    this._router.navigate([`/portal/automation-workflows/${id}/executions`]);
  }

  goToDashboard(): void {
    this._router.navigate(['/portal/automation-workflows/dashboard']);
  }

  activate(id: string): void {
    this._workflowsApi.workflowTemplatesControllerActivateV1(id).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Workflow activé');
        this.loadWorkflows();
      },
      error: (err) => {
        this._snackbar.error(
          'Erreur',
          err?.error?.message || "Erreur lors de l'activation"
        );
      },
    });
  }

  archive(id: string): void {
    this._workflowsApi.workflowTemplatesControllerArchiveV1(id).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Workflow archivé');
        this.loadWorkflows();
      },
      error: () => {
        this._snackbar.error('Erreur', "Erreur lors de l'archivage");
      },
    });
  }

  duplicate(id: string): void {
    this._workflowsApi.workflowTemplatesControllerDuplicateV1(id).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Workflow dupliqué');
        this.loadWorkflows();
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors de la duplication');
      },
    });
  }

  delete(id: string): void {
    this._confirmationService
      .confirm({
        message: 'Voulez-vous vraiment supprimer ce workflow ?',
      })
      .accept.pipe(
        switchMap(() =>
          this._workflowsApi.workflowTemplatesControllerDeleteV1(id)
        )
      )
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Workflow supprimé');
          this.loadWorkflows();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Erreur lors de la suppression');
        },
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-functional-success/10 text-functional-success';
      case 'archived':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'archived':
        return 'Archivé';
      default:
        return 'Brouillon';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'feather:check-circle';
      case 'archived':
        return 'feather:archive';
      default:
        return 'feather:edit-3';
    }
  }

  getTriggerLabel(type: string): string {
    switch (type) {
      case 'status_change':
        return 'Changement de statut';
      case 'new_lead':
        return 'Nouveau lead';
      case 'form_submission':
        return 'Soumission de formulaire';
      case 'date_based':
        return 'Basé sur date';
      default:
        return 'Manuel';
    }
  }

  getTriggerIcon(type: string): string {
    switch (type) {
      case 'status_change':
        return 'feather:refresh-cw';
      case 'new_lead':
        return 'feather:user-plus';
      case 'form_submission':
        return 'feather:file-text';
      case 'date_based':
        return 'feather:calendar';
      default:
        return 'feather:play';
    }
  }
}

export default WorkflowListingComponent;
