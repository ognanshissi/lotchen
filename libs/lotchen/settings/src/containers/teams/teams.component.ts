import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { RouterLink } from '@angular/router';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { AddTeamDialogComponent } from '../../components/add-team-dialog/add-team-dialog.component';
import { TeamsApiService } from '@talisoft/api/lotchen-client-api';
import { TasTable } from '@talisoft/ui/table';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { toSignal } from '@angular/core/rxjs-interop';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasInput } from '@talisoft/ui/input';
import { FormField, TasLabel } from '@talisoft/ui/form-field';

@Component({
  selector: 'settings-teams',
  templateUrl: './teams.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    TasText,
    TasTitle,
    RouterLink,
    TasTable,
    TimeagoPipe,
    TasCard,
    TasCardHeader,
    TasInput,
    FormField,
    TasLabel,
  ],
})
export class TeamsComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _teamsApiService = inject(TeamsApiService);

  public teams = toSignal(
    this._teamsApiService.teamsControllerFindAllTeamsV1(),
    {
      initialValue: [],
    }
  );
  public openAddDialog(): void {
    this._sideDrawerService.open(AddTeamDialogComponent, {}).closed.subscribe({
      next: (res) => {
        console.log(res);
      },
    });
  }
}

export default TeamsComponent;
