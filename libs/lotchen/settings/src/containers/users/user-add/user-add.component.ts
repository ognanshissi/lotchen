import { Component, inject, OnInit, signal } from '@angular/core';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard, TasCardAction } from '@talisoft/ui/card';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { RouterLink } from '@angular/router';
import {
  RolesApiService,
  TeamsApiService,
  UsersApiService,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';
import { TasSelect } from '@talisoft/ui/select';
import { finalize, map } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';
import { TasMultiSelect } from '@talisoft/ui/multi-select';

@Component({
  selector: 'settings-user-add',
  templateUrl: './user-add.component.html',
  standalone: true,
  imports: [
    TasText,
    TasTitle,
    TasCard,
    ButtonModule,
    TasIcon,
    FormField,
    TasInput,
    TasLabel,
    TasCardAction,
    RouterLink,
    TasSelect,
    ReactiveFormsModule,
    TasMultiSelect,
  ],
})
export class UserAddComponent implements OnInit {
  private readonly _usersApiService = inject(UsersApiService);
  private readonly _rolesApiService = inject(RolesApiService);
  private readonly _teamsApiService = inject(TeamsApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _confirmService = inject(ConfirmDialogService);
  public form!: FormGroup;

  // Resources loading
  public teams = apiResources(
    this._teamsApiService.teamsControllerFindAllTeamsV1()
  );

  public roles = apiResources(
    this._rolesApiService.rolesControllerAllRolesV1(undefined, 'id,name')
  );

  public users = apiResources(
    this._usersApiService.usersControllerAllUsersV1().pipe(
      map((data) =>
        data.map((user) => ({
          id: user.userId,
          fullName:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email,
        }))
      )
    )
  );

  public isLoadingUserCreation = signal(false);

  // Constructor
  constructor() {
    console.log(this.teams()?.isLoading);
  }

  public ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      workNumber: new FormControl(null, [Validators.required]),
      mobileNumber: new FormControl(null, [Validators.required]),
      teams: new FormControl(null, [Validators.required]),
      reportTo: new FormControl(null, [Validators.required]),
      role: new FormControl(null, [Validators.required]),
      jobTitle: new FormControl(null, [Validators.required]),
    });
  }

  public submit() {
    this.isLoadingUserCreation.set(true);
    this._usersApiService
      .usersControllerInviteUserV1({
        ...this.form.getRawValue(),
      })
      .pipe(finalize(() => this.isLoadingUserCreation.set(false)))
      .subscribe({
        error: () => {
          this._snackbarService.error(
            'Attention!',
            "Une est survenue lors de la création de l'utilisateur"
          );
        },
      });
  }
}

export default UserAddComponent;
