import { Component, input, OnInit } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';

@Component({
  selector: 'settings-role-edit',
  templateUrl: './role-edit.component.html',
  standalone: true,
  imports: [TasTitle, TasText],
})
export class RoleEditComponent implements OnInit {
  public roleId = input<string>(); // from params

  public ngOnInit(): void {
    console.log('Role ID:', this.roleId());
  }
}

export default RoleEditComponent;
