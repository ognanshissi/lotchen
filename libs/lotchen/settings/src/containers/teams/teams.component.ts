import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { RouterLink } from '@angular/router';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { AddTeamDialogComponent } from '../../components/add-team-dialog/add-team-dialog.component';
import { TeamsApiService } from '@talisoft/api/lotchen-client-api';
import { TableItemActionDirective, TasTable } from '@talisoft/ui/table';
import { TasCard } from '@talisoft/ui/card';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { apiResources } from '@talisoft/ui/api-resources';

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
    TasCard,
    TableItemActionDirective,
    TimeagoPipe,
  ],
})
export class TeamsComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _teamsApiService = inject(TeamsApiService);

  public teams = apiResources(
    this._teamsApiService.teamsControllerFindAllTeamsV1()
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
