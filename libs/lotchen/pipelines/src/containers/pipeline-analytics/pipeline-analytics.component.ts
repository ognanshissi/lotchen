import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SalesPipelinesApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';

@Component({
  selector: 'pipeline-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pipeline-analytics.component.html',
  imports: [
    CurrencyPipe,
    TasCard,
    TasCardHeader,
    TasTitle,
    TasText,
    ButtonModule,
    TasIcon,
    TasSpinner,
  ],
})
export class PipelineAnalyticsComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _pipelinesApi = inject(SalesPipelinesApiService);
  private readonly _snackbar = inject(SnackbarService);

  pipelineId = signal('');
  pipeline = signal<any>(null);
  analytics = signal<any>(null);
  isLoading = signal(true);

  maxStageCount = computed(() => {
    const data = this.analytics();
    if (!data?.stageStats) return 1;
    return Math.max(...data.stageStats.map((s: any) => s.count), 1);
  });

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) {
      this._router.navigate(['/portal/pipelines']);
      return;
    }
    this.pipelineId.set(id);
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this._pipelinesApi
      .salesPipelinesControllerFindByIdV1(this.pipelineId())
      .subscribe({
        next: (p) => {
          this.pipeline.set(p);
          this.loadAnalytics();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Pipeline introuvable');
          this._router.navigate(['/portal/pipelines']);
        },
      });
  }

  loadAnalytics(): void {
    this._pipelinesApi
      .salesPipelinesControllerAnalyticsV1(this.pipelineId(), '', '')
      .subscribe({
        next: (data) => {
          this.analytics.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Erreur lors du chargement des analytiques'
          );
          this.isLoading.set(false);
        },
      });
  }

  getBarWidth(count: number): number {
    return Math.max((count / this.maxStageCount()) * 100, 2);
  }

  goBack(): void {
    this._router.navigate([`/portal/pipelines/${this.pipelineId()}/board`]);
  }

  goToBoard(): void {
    this._router.navigate([`/portal/pipelines/${this.pipelineId()}/board`]);
  }
}

export default PipelineAnalyticsComponent;
