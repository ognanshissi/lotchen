import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { WorkflowExecutionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'workflow-execution-detail',
  standalone: true,
  templateUrl: './workflow-execution-detail.component.html',
  imports: [NgFor, NgIf, NgClass, DatePipe],
})
export class WorkflowExecutionDetailComponent implements OnInit {
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackbar = inject(SnackbarService);

  execution = signal<any | null>(null);
  isLoading = signal(false);

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('executionId');
    if (id) {
      this.loadExecution(id);
    }
  }

  loadExecution(id: string): void {
    this.isLoading.set(true);
    this._executionsApi.workflowExecutionsControllerFindByIdV1(id).subscribe({
      next: (data) => {
        this.execution.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          "Erreur lors du chargement de l'exécution"
        );
        this.isLoading.set(false);
      },
    });
  }

  retryStep(nodeId: string): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerRetryStepV1(exec._id, { nodeId })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Étape relancée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', 'Erreur lors de la relance'),
      });
  }

  skipStep(nodeId: string): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerSkipStepV1(exec._id, { nodeId })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Étape ignorée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', "Erreur lors de l'ignorance"),
      });
  }

  cancel(): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerCancelV1(exec._id)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Exécution annulée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', "Erreur lors de l'annulation"),
      });
  }

  goBack(): void {
    this._router.navigate(['/portal/automation-workflows']);
  }

  getStepIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '●';
      case 'skipped':
        return '→';
      default:
        return '○';
    }
  }

  getStepClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}

export default WorkflowExecutionDetailComponent;
