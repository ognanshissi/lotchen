import { Component, signal } from '@angular/core';
import { TasCheckbox } from '@talisoft/ui/checkbox';

@Component({
  selector: '[rowSelectionMaster]',
  standalone: true,
  template: ` <tas-checkbox
    [checked]="isChecked()"
    (change)="handleChangeEvent($event)"
  ></tas-checkbox>`,
  imports: [TasCheckbox],
})
export class RowSelectionMaster {
  public isChecked = signal(false);

  public toggleMaster() {
    this.isChecked.set(!this.isChecked());
  }

  public handleChangeEvent(event: boolean) {
    console.log(event);
  }
}
