import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from '../../../../../ui/button';
import { TasIcon } from '../../../../../ui/icon';
import {
  TasNavigationLayout,
  TasNavigationMenu,
  TasNavigationMenuItem,
  TasNavigationNavbar,
  TasNavigationSidebar,
} from '../../../../../ui/layouts';

@Component({
  selector: 'common-portal-layout',
  standalone: true,
  templateUrl: 'portal-layout.component.html',
  imports: [
    RouterOutlet,
    ButtonModule,
    TasIcon,
    TasNavigationLayout,
    TasNavigationSidebar,
    TasNavigationNavbar,
    TasNavigationMenu,
    TasNavigationMenuItem,
  ],
})
export class PortalLayoutComponent {}
