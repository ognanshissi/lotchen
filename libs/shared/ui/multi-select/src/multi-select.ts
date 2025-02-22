import { Component, input } from '@angular/core';

@Component({
  selector: 'tas-select[multiple]',
  templateUrl: './multi-select.html',
  standalone: true,
  imports: [],
})
export class TasMultiSelect {
  public options = input([]);

  constructor() {
    console.log('This is multiple select component that is called');
  }
}
