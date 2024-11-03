import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'tas-text',
  template: ` <ng-content></ng-content>`,
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      tas-text {
        @apply text-gray-600 block;
      }
    `,
  ],
})
export class TasText {}
