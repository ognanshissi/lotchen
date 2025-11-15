import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserDetailResolver } from '../../../services/user-detail.resolver.service';

@Component({
  selector: 'settings-user-edit',
  standalone: true,
  templateUrl: './user-edit.component.html',
  imports: [ButtonModule, TasIcon, TasText, TasTitle, RouterLink],
})
export class UserEditComponent {
  private readonly _activeRoute = inject(ActivatedRoute);

  public user = toSignal(
    this._activeRoute.data.pipe(
      map((data) => data['detail'] as UserDetailResolver)
    )
  );
}

export default UserEditComponent;
