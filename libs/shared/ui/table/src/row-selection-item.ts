import { Component } from '@angular/core';
import { TasCheckbox } from '@talisoft/ui/checkbox';

@Component({
  selector: '[rowSelectionItem]',
  standalone: true,
  imports: [TasCheckbox],
  template: ` <tas-checkbox></tas-checkbox>`,
  styles: [],
})
export class RowSelectionItem {}
