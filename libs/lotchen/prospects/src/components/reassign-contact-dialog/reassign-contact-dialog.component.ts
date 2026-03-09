import { Component, inject, signal } from '@angular/core';
import {
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  TerritoriesApiService,
  AgenciesApiService,
  TeamsApiService,
  UsersApiService,
  ContactsApiService,
  BulkAssignContactsCommandRequest,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TasText } from '@talisoft/ui/text';

interface ReassignDialogData {
  contactIds: string[];
}

@Component({
  selector: 'prospects-reassign-contact-dialog',
  templateUrl: './reassign-contact-dialog.component.html',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasTitle,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    ButtonModule,
    FormField,
    TasLabel,
    TasSelect,
    ReactiveFormsModule,
    TasText,
  ],
})
export class ReassignContactDialogComponent {
  private readonly _snackbar = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _data = inject<ReassignDialogData>(DIALOG_DATA);
  private readonly _territoriesApi = inject(TerritoriesApiService);
  private readonly _agenciesApi = inject(AgenciesApiService);
  private readonly _teamsApi = inject(TeamsApiService);
  private readonly _usersApi = inject(UsersApiService);
  private readonly _contactsApi = inject(ContactsApiService);

  public territoryControl = new FormControl<string | null>(null);
  public agencyControl = new FormControl<string | null>(null);
  public teamControl = new FormControl<string | null>(null);
  public agentControl = new FormControl<string | null>(null);

  public submitting = signal(false);

  public territories = apiResources(
    this._territoriesApi.territoriesControllerAllTerritoriesV1('id,name', 100)
  );

  public agencies = apiResources(
    this._agenciesApi.agenciesControllerFindAllAgenciesV1()
  );

  public teams = apiResources(
    this._teamsApi.teamsControllerFindAllTeamsV1(undefined, 'id,name')
  );

  public users = apiResources(
    this._usersApi.usersControllerAllUsersV1(undefined, 'id,firstName,lastName')
  );

  public get contactCount(): number {
    return this._data?.contactIds?.length ?? 0;
  }

  public submit(): void {
    const payload: BulkAssignContactsCommandRequest = {
      ids: this._data.contactIds,
    };

    if (this.territoryControl.value) {
      payload['territoryId'] = this.territoryControl.value;
    }
    if (this.agencyControl.value) {
      payload['agencyId'] = this.agencyControl.value;
    }
    if (this.teamControl.value) {
      payload['assignedToTeamId'] = this.teamControl.value;
    }
    if (this.agentControl.value) {
      payload['assignedToUserId'] = this.agentControl.value;
    }

    if (Object.keys(payload).length <= 1) {
      this._snackbar.error(
        'Attention',
        'Veuillez sélectionner au moins un champ à assigner'
      );
      return;
    }

    this.submitting.set(true);

    this._contactsApi
      .contactsControllerBulkAssignContactsV1(payload)
      .subscribe({
        next: () => {
          this._snackbar.success(
            'Succès',
            `${this.contactCount} contact(s) réassigné(s) avec succès`
          );
          this.submitting.set(false);
          this._dialogRef.close('reassigned');
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Impossible de réassigner les contacts'
          );
          this.submitting.set(false);
        },
      });
  }
}
