import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { WorkflowTemplatesApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'workflows-listing',
  standalone: true,
  templateUrl: './workflow-listing.component.html',
  imports: [NgFor, NgIf, NgClass, RouterLink, DatePipe],
})
export class WorkflowListingComponent implements OnInit {
  private readonly _workflowsApi = inject(WorkflowTemplatesApiService);
  private readonly _router = inject(Router);
  private readonly _snackbar = inject(SnackbarService);

  public workflows = signal<any[]>([]);
  public isLoading = signal(false);
  public filterStatus = signal<string | undefined>(undefined);

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
    this._workflowsApi.workflowTemplatesControllerDeleteV1(id).subscribe({
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
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
}

export default WorkflowListingComponent;
