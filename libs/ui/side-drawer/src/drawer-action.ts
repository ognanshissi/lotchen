import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'tas-drawer-action',
  standalone: true,
  template: ` <ng-content></ng-content> `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      tas-drawer-action {
        @apply block bg-white sticky bottom-0 flex justify-end space-x-4 mt-4 py-2 z-10;
      }
    `,
  ],
})
export class TasDrawerAction {}
