import { Component, HostBinding } from '@angular/core';


@Component({
  selector: 'tas-title',
  template: `
  <div class="text-2xl font-bold">
    <ng-content></ng-content>
  </div>
  `,
  standalone: true,
})
export class TasTitle {

  static nextId = 0;
  @HostBinding() id = `tas-title-id-${TasTitle.nextId++}`;

}
