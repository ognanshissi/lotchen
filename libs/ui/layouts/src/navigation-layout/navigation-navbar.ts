import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'tas-navigation-navbar',
  standalone: true,
  template: ` <div class="flex space-x-2">
      <button (click)="toggleCollapseMenu.emit()">
        <tas-icon iconName="feather:menu" class="text-gray-500"></tas-icon>
      </button>
      <p>
        <span class="text-primary text-xl font-bold">Lotchen </span
        ><span class="text-gray-500 text-xs">Micro-finance</span>
      </p>
    </div>
    <div class="flex space-x-4">
      <button tas-raised-button color="primary" size="small">
        <tas-icon iconName="feather:plus" iconSize="md"></tas-icon>
      </button>

      <div class="flex space-x-1 items-center">
        <span class="sr-only">Ambroise BAZIE </span>
        <button class="bg-gray-200 rounded-full p-2" title="Ambroise BAZIE">
          <tas-icon
            iconName="feather:user"
            iconClass="text-gray-500"
          ></tas-icon>
        </button>
      </div>
    </div>`,
  styles: [
    `
      tas-navigation-navbar {
        @apply flex justify-between border-b items-center py-1 px-2 border-gray-300 bg-white sticky top-0;
      }
    `,
  ],
  imports: [ButtonModule, TasIcon],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasNavigationNavbar {
  public toggleCollapseMenu: EventEmitter<void> = new EventEmitter<void>();
}
