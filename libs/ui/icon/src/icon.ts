import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tas-icon',
  template: `<mat-icon [svgIcon]="iconName" [class]="iconClass()"></mat-icon>`,
  standalone: true,
  imports: [
    MatIconModule,
  ],
  exportAs: 'tasIcon',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      tas-icon {
          @apply flex items-center;
      }
    `
  ]
})
export class TasIcon {
  @Input({
    required: true
  }) iconName!: string;

  iconClass = input();
  fontSet = input();
  inline = input();
  color = input();

  ariaHidden = input({
    alias: 'aria-hidden'
  });

  @HostBinding('aria-hidden')
  get aria() {
    return this.ariaHidden;
  }
}