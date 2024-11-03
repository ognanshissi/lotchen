import { booleanAttribute, Component, input } from '@angular/core';
import { TasSpinner } from '@talisoft/ui/spinner';
import { NgIf } from '@angular/common';

@Component({
  selector: 'tas-container',
  template: `
    <div class="relative">
      @if (isLoading()) {
      <div
        class="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center"
      >
        <div class="bg-black">
          <tas-spinner/>
        </div>
      </div>
      }
      <ng-content></ng-content>
    </div>
  `,
  imports: [TasSpinner, NgIf],
  standalone: true,
})
export class TasContainer {
  public isLoading = input(false, { transform: booleanAttribute });
  public hasPermissions = input<string[] | undefined>(undefined);
}
