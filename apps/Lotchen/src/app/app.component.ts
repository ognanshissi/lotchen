import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@talisoft/ui/button';

@Component({
  standalone: true,
  imports: [RouterModule, ButtonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Lotchen';
}
