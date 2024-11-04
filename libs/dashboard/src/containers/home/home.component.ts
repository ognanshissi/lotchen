import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  TasNavigationLayout,
  TasNavigationNavbar,
  TasNavigationSidebar,
} from '@talisoft/ui/layouts';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    TasNavigationLayout,
    TasNavigationNavbar,
    TasNavigationSidebar,
  ],
})
export class HomeComponent {}
