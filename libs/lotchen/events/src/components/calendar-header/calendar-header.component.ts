import { Component, input, output } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

export type CalendarViewMode = 'month' | 'week';

@Component({
  selector: 'events-calendar-header',
  standalone: true,
  imports: [ButtonModule, TasIcon],
  template: `
    <div
      class="flex items-center justify-between py-4 px-6 bg-white border-b border-gray-200"
    >
      <div class="flex items-center gap-3">
        <button tas-outlined-button (click)="prev.emit()">
          <tas-icon iconName="feather:chevron-left"></tas-icon>
        </button>
        <button tas-outlined-button (click)="today.emit()">Aujourd'hui</button>
        <button tas-outlined-button (click)="next.emit()">
          <tas-icon iconName="feather:chevron-right"></tas-icon>
        </button>
        <h2 class="text-xl font-semibold ml-4">{{ periodLabel() }}</h2>
      </div>

      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          [class.bg-white]="viewMode() === 'month'"
          [class.shadow-sm]="viewMode() === 'month'"
          [class.text-primary]="viewMode() === 'month'"
          (click)="viewModeChange.emit('month')"
        >
          Mois
        </button>
        <button
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          [class.bg-white]="viewMode() === 'week'"
          [class.shadow-sm]="viewMode() === 'week'"
          [class.text-primary]="viewMode() === 'week'"
          (click)="viewModeChange.emit('week')"
        >
          Semaine
        </button>
      </div>
    </div>
  `,
})
export class CalendarHeaderComponent {
  viewMode = input.required<CalendarViewMode>();
  periodLabel = input.required<string>();
  viewModeChange = output<CalendarViewMode>();
  prev = output<void>();
  next = output<void>();
  today = output<void>();
}
