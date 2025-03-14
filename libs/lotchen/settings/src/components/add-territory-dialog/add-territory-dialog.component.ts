import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasInput } from '@talisoft/ui/input';
import {
  TerritoriesApiService,
  UsersApiService,
} from '@talisoft/api/lotchen-client-api';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map } from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TasSelect } from '@talisoft/ui/select';
import { TasMultiSelect } from '@talisoft/ui/multi-select';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'settings-add-territory-dialog',
  templateUrl: './add-territory-dialog.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    FormField,
    TasClosableDrawer,
    TasDrawerAction,
    TasIcon,
    TasSideDrawer,
    TasTitle,
    TasText,
    TasDrawerTitle,
    TasDrawerContent,
    TasLabel,
    TasInput,
    FormsModule,
    TasSelect,
    ReactiveFormsModule,
    TasMultiSelect,
  ],
})
export class AddTerritoryDialogComponent implements OnInit {
  private readonly _usersApiService = inject(UsersApiService);
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _snackbarService = inject(SnackbarService);

  private readonly _dialogRef = inject(DialogRef);

  public form!: FormGroup;
  public isLoading = false;
  public errorMessage: string | null = null;

  public territories = toSignal(
    this._territoriesApiService.territoriesControllerAllTerritoriesV1(
      'id,name',
      30
    ),
    { initialValue: [] }
  );

  public users = toSignal(
    this._usersApiService.usersControllerAllUsersV1().pipe(map((res) => res)),
    { initialValue: [] }
  );

  public ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      parentId: new FormControl(null),
      childrenIds: new FormControl(null),
    });
  }

  public submit(): void {
    this.isLoading = true;
    this._territoriesApiService
      .territoriesControllerCreateTerritoryV1(this.form.getRawValue())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this._snackbarService.success(
            'Félicitation !',
            'Le territoire a été créé avec succès.'
          );
          this._dialogRef.close(res);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this._snackbarService.error(
            'Attention !',
            `Vous avez un message d'erreur`
          );
        },
      });
  }
}
