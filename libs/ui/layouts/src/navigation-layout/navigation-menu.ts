import { Component, contentChildren } from '@angular/core';
import { TasNavigationMenuItem } from './navigation-menu-item';

@Component({
  selector: 'NavigationMenu',
  template: ` <ng-content></ng-content> `,
  standalone: true,
})
export class TasNavigationMenu {
  public navigationMenuItems = contentChildren<TasNavigationMenuItem>(
    TasNavigationMenuItem,
    { descendants: true }
  );
}
