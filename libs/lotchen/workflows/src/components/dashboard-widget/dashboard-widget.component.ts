import { Component, input } from '@angular/core';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'workflows-dashboard-widget',
  standalone: true,
  imports: [TasCard, TasIcon],
  template: `
    <tas-card class="p-2">
      <div class="flex my-4 space-y-3 flex-col items-center">
        <div class="flex items-center gap-2 mb-3">
          <div class="flex items-center justify-center w-20 h-20">
            <tas-icon
              [iconName]="icon() ?? ''"
              class="text-lg"
              [iconSize]="'xl'"
              [class]="iconColorClass()"
            ></tas-icon>
          </div>
        </div>
        <div class="text-4xl font-bold text-gray-900">
          {{ data() || 0 }}
        </div>
        <div
          class="text-xs text-gray-400 uppercase tracking-wide font-semibold mt-1"
        >
          {{ title() }}
        </div>

        <ng-content select="[widgetSubtitle]"></ng-content>
      </div>
    </tas-card>
  `,
})
export class DashboardWidgetComponent {
  public data = input<number | string>();
  public title = input<string>();
  public icon = input<string>();
  public iconColorClass = input<string>();
  public subtitle = input<string>();
}
