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
  templateUrl: './pipeline-column.component.html',
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
