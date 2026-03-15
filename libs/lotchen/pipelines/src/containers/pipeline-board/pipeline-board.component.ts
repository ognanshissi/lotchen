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
import { CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Dialog } from '@angular/cdk/dialog';
import {
  SalesPipelinesApiService,
  DealsApiService,
} from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';
import { PipelineColumnComponent } from '../../components/pipeline-column/pipeline-column.component';
import { AddDealDialogComponent } from '../../components/add-deal-dialog/add-deal-dialog.component';
import { DealDetailDrawerComponent } from '../../components/deal-detail-drawer/deal-detail-drawer.component';

@Component({
  selector: 'pipeline-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pipeline-board.component.html',
  imports: [
    CdkDropListGroup,
    TasCard,
    TasCardHeader,
    TasTitle,
    ButtonModule,
    TasIcon,
    TasSpinner,
    PipelineColumnComponent,
  ],
})
export class PipelineBoardComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _pipelinesApi = inject(SalesPipelinesApiService);
  private readonly _dealsApi = inject(DealsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _dialog = inject(Dialog);

  pipelineId = signal('');
  pipeline = signal<any>(null);
  deals = signal<any[]>([]);
  isLoading = signal(true);

  stages = computed(() => {
    const p = this.pipeline();
    if (!p) return [];
    return [...(p.stages || [])].sort((a: any, b: any) => a.order - b.order);
  });

  dealsByStage = computed(() => {
    const map = new Map<string, any[]>();
    for (const stage of this.stages()) {
      map.set(stage.stageId, []);
    }
    for (const deal of this.deals()) {
      const list = map.get(deal.stageId);
      if (list) {
        list.push(deal);
      }
    }
    // Sort by order within each stage
    for (const [, list] of map) {
      list.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }
    return map;
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
          this.loadDeals();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Pipeline introuvable');
          this._router.navigate(['/portal/pipelines']);
        },
      });
  }

  loadDeals(): void {
    this._dealsApi.dealsControllerFindAllV1(this.pipelineId()).subscribe({
      next: (d) => {
        this.deals.set(d);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors du chargement des deals');
        this.isLoading.set(false);
      },
    });
  }

  getDealsForStage(stageId: string): any[] {
    return this.dealsByStage().get(stageId) || [];
  }

  onDrop(event: CdkDragDrop<string>): void {
    const deal = event.item.data
      ? event.item.data
      : this.deals().find((d) => d.stageId === event.previousContainer.data);

    // Get the deal from the dragged element
    const previousStageId = event.previousContainer.data;
    const targetStageId = event.container.data;

    // Find the actual deal that was dragged
    const previousDeals = this.getDealsForStage(previousStageId as string);
    const draggedDeal = previousDeals[event.previousIndex];

    if (!draggedDeal) return;

    if (
      previousStageId === targetStageId &&
      event.previousIndex === event.currentIndex
    ) {
      return;
    }

    // Optimistic UI update
    const updatedDeals = [...this.deals()];
    const dealIndex = updatedDeals.findIndex((d) => d._id === draggedDeal._id);
    if (dealIndex >= 0) {
      updatedDeals[dealIndex] = {
        ...updatedDeals[dealIndex],
        stageId: targetStageId,
        order: event.currentIndex,
      };
      this.deals.set(updatedDeals);
    }

    if (previousStageId !== targetStageId) {
      this._dealsApi
        .dealsControllerMoveStageV1(draggedDeal._id, {
          targetStageId: targetStageId as string,
          order: event.currentIndex,
        })
        .subscribe({
          next: () => {
            this.loadDeals();
          },
          error: (err) => {
            this._snackbar.error(
              'Erreur',
              err?.error?.message || 'Erreur lors du déplacement'
            );
            this.loadDeals();
          },
        });
    } else {
      // Same stage reorder
      const stageDeals = this.getDealsForStage(targetStageId as string);
      const dealIds = stageDeals.map((d: any) => d._id);
      this._dealsApi
        .dealsControllerReorderV1({
          dealIds,
          stageId: targetStageId as string,
        })
        .subscribe({
          error: () => this.loadDeals(),
        });
    }
  }

  addDeal(): void {
    const firstStage = this.stages().find((s: any) => !s.isWon && !s.isLost);
    const ref = this._dialog.open(AddDealDialogComponent, {
      data: {
        pipelineId: this.pipelineId(),
        stageId: firstStage?.stageId,
      },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadDeals();
    });
  }

  openDealDetail(deal: any): void {
    const ref = this._dialog.open(DealDetailDrawerComponent, {
      data: { dealId: deal._id },
    });
    ref.closed.subscribe((result) => {
      if (result === 'refresh') this.loadDeals();
    });
  }

  winDeal(deal: any): void {
    this._dealsApi.dealsControllerWinV1(deal._id).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Deal marqué comme gagné');
        this.loadDeals();
      },
      error: (err) => {
        this._snackbar.error('Erreur', err?.error?.message || 'Erreur');
      },
    });
  }

  loseDeal(deal: any): void {
    this._dealsApi
      .dealsControllerLoseV1(deal._id, { lostReason: '' })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Deal marqué comme perdu');
          this.loadDeals();
        },
        error: (err) => {
          this._snackbar.error('Erreur', err?.error?.message || 'Erreur');
        },
      });
  }

  goBack(): void {
    this._router.navigate(['/portal/pipelines']);
  }

  goToAnalytics(): void {
    this._router.navigate([`/portal/pipelines/${this.pipelineId()}/analytics`]);
  }
}

export default PipelineBoardComponent;
