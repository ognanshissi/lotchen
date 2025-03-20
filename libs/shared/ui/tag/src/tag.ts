import { Component } from '@angular/core';

@Component({
  selector: 'tas-tag',
  template: ` <div class="bg-gray-200 text-primary rounded-full px-2 py-3">
    <ng-content></ng-content>
  </div>`,
  standalone: true,
})
export class TasTag {}
