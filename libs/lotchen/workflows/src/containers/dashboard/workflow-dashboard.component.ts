import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkflowExecutionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'workflow-dashboard',
  standalone: true,
  templateUrl: './workflow-dashboard.component.html',
  imports: [NgIf, NgFor, DatePipe, RouterLink],
})
export class WorkflowDashboardComponent implements OnInit {
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _snackbar = inject(SnackbarService);

  stats = signal<any | null>(null);
  recentExecutions = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);

    this._executionsApi.workflowExecutionsControllerGetDashboardV1().subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          'Erreur lors du chargement du tableau de bord'
        );
      },
    });

    this._executionsApi.workflowExecutionsControllerFindAllV1().subscribe({
      next: (data) => {
        this.recentExecutions.set(data.slice(0, 20));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}min`;
  }
}

export default WorkflowDashboardComponent;
