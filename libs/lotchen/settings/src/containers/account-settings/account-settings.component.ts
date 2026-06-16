import { Component, OnInit } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';

@Component({
  selector: 'settings-account-settings',
  templateUrl: './account-settings.component.html',
  standalone: true,
  imports: [ButtonModule, TasCard, TasCardHeader, TasIcon, TasText, TasTitle],
})
export class AccountSettingsComponent implements OnInit {
  public ngOnInit() {
    console.log('Log');
  }
}

export default AccountSettingsComponent;
