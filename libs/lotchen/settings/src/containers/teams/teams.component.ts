import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'settings-teams',
  templateUrl: './teams.component.html',
  standalone: true,
  imports: [ButtonModule, TasIcon, TasText, TasTitle, RouterLink],
})
export class TeamsComponent {
  public openAddDialog() {}
}

export default TeamsComponent;
