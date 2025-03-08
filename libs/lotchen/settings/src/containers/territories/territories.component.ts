import { Component, inject, OnInit } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  RowSelectionItem,
  RowSelectionMaster,
  TableItemActionDirective,
  TasTable,
} from '@talisoft/ui/table';
import { RouterLink } from '@angular/router';
import {
  FilterDtoOperatorEnum,
  TerritoriesApiService,
} from '@talisoft/api/lotchen-client-api';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { AddTerritoryDialogComponent } from '../../components/add-territory-dialog/add-territory-dialog.component';
import { catchError, of } from 'rxjs';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { apiResources } from '@talisoft/ui/api-resources';

@Component({
  selector: 'settings-territories',
  templateUrl: './territories.component.html',
  standalone: true,
  imports: [
    TasTitle,
    TasText,
    TasCard,
    ButtonModule,
    TasIcon,
    TasTable,
    TableItemActionDirective,
    RouterLink,
    TimeagoPipe,
    RowSelectionMaster,
    RowSelectionItem,
  ],
})
export class TerritoriesComponent implements OnInit {
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _sideDrawerService = inject(SideDrawerService);

  public territories = apiResources(
    this._territoriesApiService
      .territoriesControllerAllTerritoriesV1(
        'id,name,createdByInfo,parentInfo,createdAt,updatedAt'
      )
      .pipe(catchError(() => of([])))
  );

  public openAddDialog(): void {
    this._sideDrawerService.open(AddTerritoryDialogComponent, {
      width: '700px',
    });
  }

  public ngOnInit() {
    this._territoriesApiService
      .territoriesControllerPaginateAllTerritoriesV1({
        pageIndex: 0,
        pageSize: 30,
        sort: ['name:asc'],
        filters: {
          name: { operator: FilterDtoOperatorEnum.Eq, value: 'Region 3' },
        },
      })
      .subscribe((res) => console.log(res));
  }
}

export default TerritoriesComponent;
