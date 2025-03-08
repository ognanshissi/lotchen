import { Component, inject, OnInit } from '@angular/core';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasSelect } from '@talisoft/ui/select';
import {
  TeamsApiService,
  TerritoriesApiService,
  UsersApiService,
} from '@talisoft/api/lotchen-client-api';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasInput } from '@talisoft/ui/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { TasAlert } from '@talisoft/ui/alert';
import { NgIf } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';
import { TasMultiSelect } from '@talisoft/ui/multi-select';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'settings-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  standalone: true,
  imports: [
    FormField,
    TasDrawerContent,
    TasSideDrawer,
    TasTitle,
    TasText,
    TasSelect,
    TasLabel,
    TasDrawerTitle,
    TasDrawerAction,
    ButtonModule,
    TasIcon,
    TasInput,
    TasClosableDrawer,
    ReactiveFormsModule,
    TasAlert,
    NgIf,
    TasMultiSelect,
  ],
})
export class AddTeamDialogComponent implements OnInit {
  private readonly _userService = inject(UsersApiService);
  private readonly _teamsApiService = inject(TeamsApiService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _snackbarService = inject(SnackbarService);

  public isLoading = false;
  public errorMessage: string | null = null;

  public form!: FormGroup;

  public users = toSignal(this._userService.usersControllerAllUsersV1(), {
    initialValue: [],
  });

  public territories = toSignal(
    this._territoriesApiService.territoriesControllerAllTerritoriesV1(
      'id,name'
    ),
    { initialValue: [] }
  );

  public ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      managerId: new FormControl(null, [Validators.required]),
      memberIds: new FormControl(null),
      territoryId: new FormControl(null),
    });

    this.form.valueChanges.subscribe((res) => console.log({ res }));
  }

  /**
   * Submit team creation payload
   */
  public submit(): void {
    this.errorMessage = null;
    this.isLoading = true;
    this._teamsApiService
      .teamsControllerCreateTeamV1({
        ...this.form.getRawValue(),
        memberIds: [this.form.getRawValue().memberIds],
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this._snackbarService.success(
            'Félicitations !',
            `L'équipe ${
              this.form.getRawValue().name
            } a été enregistré avec succès.`
          );
          this._dialogRef.close(res);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
          this._snackbarService.error(
            'Attention !',
            'Une erreur est survenue pendant la création.'
          );
        },
      });
  }
}
