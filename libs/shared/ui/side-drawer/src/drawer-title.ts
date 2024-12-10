import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { TasIcon } from '@talisoft/ui/icon';
import { TasClosableDrawer } from './closable-drawer.directive';

@Component({
  selector: 'tas-drawer-title',
  standalone: true,
  template: `
    <div class="mr-4 block">
      <ng-content></ng-content>
    </div>
    @if (closable()) {
    <button closable-drawer type="button" title="close side drawer">
      <tas-icon
        iconName="feather:x-circle"
        iconSize="lg"
        aria-label="Close side drawer Icon"
      ></tas-icon>
    </button>
    }
  `,
  styles: [
    `
      tas-drawer-title {
        @apply px-4 py-3 border-b border-b-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center rounded-t-xl;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TasIcon, TasClosableDrawer],
})
export class TasDrawerTitle {
  public close: EventEmitter<void> = new EventEmitter<void>();

  public closable = signal<boolean>(false);
}
