import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'deal-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [DatePipe, CurrencyPipe, CdkDrag, TasIcon],
  template: `
    <div
      cdkDrag
      class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
      [style.border-left]="'3px solid ' + (stageColor() || '#6366f1')"
      (click)="cardClicked.emit(deal())"
    >
      <div class="flex items-start justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-900 line-clamp-2">
          {{ deal().title }}
        </h4>
      </div>

      @if (deal().amount) {
      <div class="text-sm font-semibold text-primary mb-2">
        {{
          deal().amount
            | currency : deal().currency || 'XOF' : 'symbol-narrow' : '1.0-0'
        }}
      </div>
      } @if (deal().contactName) {
      <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <tas-icon iconName="feather:user" class="text-[10px]"></tas-icon>
        {{ deal().contactName }}
      </div>
      } @if (deal().assignedToName) {
      <div class="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <tas-icon iconName="feather:briefcase" class="text-[10px]"></tas-icon>
        {{ deal().assignedToName }}
      </div>
      } @if (deal().expectedCloseDate) {
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <tas-icon iconName="feather:calendar" class="text-[10px]"></tas-icon>
        {{ deal().expectedCloseDate | date : 'dd/MM/yyyy' }}
      </div>
      }

      <div
        class="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          class="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded text-functional-success hover:bg-functional-success/10 transition-colors"
          (click)="$event.stopPropagation(); winClicked.emit(deal())"
        >
          <tas-icon
            iconName="feather:check-circle"
            class="text-[10px]"
          ></tas-icon>
          Gagné
        </button>
        <button
          class="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded text-functional-error hover:bg-functional-error/10 transition-colors"
          (click)="$event.stopPropagation(); loseClicked.emit(deal())"
        >
          <tas-icon iconName="feather:x-circle" class="text-[10px]"></tas-icon>
          Perdu
        </button>
      </div>
    </div>
  `,
})
export class DealCardComponent {
  deal = input.required<any>();
  stageColor = input<string>('#6366f1');

  cardClicked = output<any>();
  winClicked = output<any>();
  loseClicked = output<any>();
}
