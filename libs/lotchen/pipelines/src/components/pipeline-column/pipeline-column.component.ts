import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
} from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { DealCardComponent } from '../deal-card/deal-card.component';
import { TasCurrencyPipe } from '@lotchen/lotchen/common/pipes';

@Component({
  selector: 'pipeline-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [TasCurrencyPipe, CdkDropList, DealCardComponent, TasCurrencyPipe],
  template: `
    <div class="flex flex-col h-full min-w-[280px] max-w-[320px]">
      <!-- Column header -->
      <div
        class="p-3 rounded-t-lg"
        [style.background-color]="stage().color + '10'"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div
              class="w-2.5 h-2.5 rounded-full"
              [style.background-color]="stage().color"
            ></div>
            <h3 class="text-sm font-semibold text-gray-900">
              {{ stage().name }}
            </h3>
          </div>
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full bg-white text-gray-600"
          >
            {{ deals().length }}
          </span>
        </div>
        <div class="text-xs text-gray-500">
          {{ totalValue() | tasCurrency : currency() }}
        </div>
      </div>

      <!-- Cards area -->
      <div
        cdkDropList
        [cdkDropListData]="stage().stageId"
        (cdkDropListDropped)="dropped.emit($event)"
        class="flex-1 p-2 space-y-2 bg-gray-50 rounded-b-lg min-h-[100px] overflow-y-auto"
      >
        @for (deal of deals(); track deal._id) {
        <deal-card
          [deal]="deal"
          [stageColor]="stage().color"
          (cardClicked)="dealClicked.emit($event)"
          (winClicked)="winClicked.emit($event)"
          (loseClicked)="loseClicked.emit($event)"
        ></deal-card>
        }
      </div>
    </div>
  `,
})
export class PipelineColumnComponent {
  stage = input.required<any>();
  deals = input.required<any[]>();
  currency = input<string>();

  dropped = output<any>();
  dealClicked = output<any>();
  winClicked = output<any>();
  loseClicked = output<any>();

  totalValue = computed(() =>
    this.deals().reduce((sum, d) => sum + (d.amount || 0), 0)
  );
}
