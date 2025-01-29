import {
  AfterViewInit,
  booleanAttribute,
  Component,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { TasDrawerTitle } from './drawer-title';
import { TasDrawerContent } from './drawer-content';
import { TasDrawerAction } from './drawer-action';

const DEFAULT_SIDE_DRAWER_WIDTH = '500px';

@Component({
  selector: 'tas-side-drawer',
  standalone: true,
  template: `
    <div
      class="absolute top-0 left-0 right-0 flex justify-end w-full h-full pr-2 overflow-y-hidden items-center"
    >
      <div
        style="height: calc(100vh - 20px)"
        class="bg-white rounded-xl  relative grid grid-rows-[60px_auto_50px] h-full overflow-hidden"
        [style]="{ width: width() }"
      >
        <ng-content select="tas-drawer-title"></ng-content>
        <div class="overflow-y-auto p-4" style="height: calc(100vh - 58px)">
          <ng-content select="tas-drawer-content"></ng-content>
        </div>
        <ng-content select="tas-drawer-action"></ng-content>
      </div>
    </div>
  `,
})
export class TasSideDrawer implements AfterViewInit {
  private readonly _matDialogRef = inject(DialogRef);
  public width = input<string>(DEFAULT_SIDE_DRAWER_WIDTH);

  public titleDrawer = contentChild<TasDrawerTitle>(TasDrawerTitle, {
    descendants: true,
  });
  public contentDrawer = contentChild<TasDrawerContent>(TasDrawerContent, {
    descendants: true,
  });

  public actionsDrawer = contentChild<TasDrawerAction>(TasDrawerAction, {
    descendants: true,
  });

  public closable = input(true, { transform: booleanAttribute });

  ngAfterViewInit() {
    if (this.titleDrawer) {
      this.titleDrawer()?.closable.set(this.closable());

      this.titleDrawer()?.close.subscribe(() => {
        this._matDialogRef.close();
      });
    }
  }
}
