import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'Text, [text]',
  template: ` <ng-content></ng-content>`,
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      Text {
        @apply text-gray-700 block text-sm;
      }
    `,
  ],
})
export class TasText {
  @HostBinding('role')
  role = 'paragraph';
}
