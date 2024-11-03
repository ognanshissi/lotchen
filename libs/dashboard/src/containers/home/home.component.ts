import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [ButtonModule, TasIcon],
})
export class HomeComponent {}
