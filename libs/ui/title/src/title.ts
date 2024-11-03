import { Component, HostBinding } from '@angular/core';


@Component({
  selector: 'tas-title',
  template: `
  <h1 class="text-5xl font-bold">
    <ng-content></ng-content>
  </h1>
  `,
  standalone: true,
})
export class TasTitle {

  static nextId = 0;
  @HostBinding() id = `tas-title-id-${TasTitle.nextId++}`;

}
