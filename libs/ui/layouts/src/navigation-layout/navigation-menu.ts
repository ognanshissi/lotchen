import { AfterViewInit, Component, contentChildren } from '@angular/core';
import { TasNavigationMenuItem } from './navigation-menu-item';

@Component({
  selector: 'NavigationMenu',
  template: ` <ng-content></ng-content> `,
  standalone: true,
})
export class TasNavigationMenu implements AfterViewInit {
  public navigationMenuItems = contentChildren<TasNavigationMenuItem>(
    TasNavigationMenuItem,
    { descendants: true }
  );

  public ngAfterViewInit() {
    if (this.navigationMenuItems()) {
      console.log(this.navigationMenuItems());
    }
  }
}
