import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  TasNavigationLayout,
  TasNavigationNavbar,
  TasNavigationSidebar,
} from '@talisoft/ui/layouts';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';

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
    TasText,
    TasTitle,
  ],
})
export class HomeComponent {}
