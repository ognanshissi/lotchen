import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasSpinner } from '@talisoft/ui/spinner';
import { SnackbarService } from '@talisoft/ui/snackbar';

interface MetricsResult {
  totalAssignments: number;
  assignmentsByDay: { date: string; count: number }[];
  assignmentsByTargetType: { type: string; count: number }[];
  escalationCount: number;
}

@Component({
  selector: 'settings-dispatch-metrics',
  templateUrl: './dispatch-metrics.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TasTitle,
    TasCard,
    TasIcon,
    ButtonModule,
    TasSpinner,
  ],
})
export class DispatchMetricsComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackbar = inject(SnackbarService);

  public readonly ruleId = this._route.snapshot.paramMap.get('id')!;

  public isLoading = signal(false);
  public metrics = signal<MetricsResult | null>(null);
  public fromDate = signal('');
  public toDate = signal('');

  public ngOnInit(): void {
    this.loadMetrics();
  }

  public loadMetrics(): void {
    this.isLoading.set(true);
    const params: Record<string, string> = {};
    if (this.fromDate()) params['from'] = this.fromDate();
    if (this.toDate()) params['to'] = this.toDate();

    this._http
      .get<MetricsResult>(`/api/v1/dispatch-rules/${this.ruleId}/metrics`, {
        params,
      })
      .subscribe({
        next: (data) => {
          this.metrics.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de charger les métriques');
          this.isLoading.set(false);
        },
      });
  }

  public getTargetTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      agent: 'Agent',
      team: 'Équipe',
      queue: 'File',
      department: 'Département',
    };
    return labels[type] ?? type;
  }

  public maxDayCount(): number {
    return Math.max(
      1,
      ...(this.metrics()?.assignmentsByDay ?? []).map((d) => d.count)
    );
  }
}

export default DispatchMetricsComponent;
