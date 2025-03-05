import { Component, inject, OnInit } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TableItemActionDirective, TasTable } from '@talisoft/ui/table';
import { RouterLink } from '@angular/router';
import { TerritoriesApiService } from '@talisoft/api/lotchen-client-api';
import { toSignal } from '@angular/core/rxjs-interop';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { AddTerritoryDialogComponent } from '../../components/add-territory-dialog/add-territory-dialog.component';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { catchError, of } from 'rxjs';
import { TimeagoPipe } from '@talisoft/ui/timeago';

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
    FormField,
    TasInput,
    TasLabel,
    TasCardHeader,
    TimeagoPipe,
  ],
})
export class TerritoriesComponent implements OnInit {
  private readonly _territoriesApiService = inject(TerritoriesApiService);
  private readonly _sideDrawerService = inject(SideDrawerService);

  public territories = toSignal(
    this._territoriesApiService
      .territoriesControllerAllTerritoriesV1()
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
        pageSize: 31,
        sort: ['name:asc'],
        filters: { name: 'Region 3' },
      })
      .subscribe((res) => console.log(res));
  }
}

export default TerritoriesComponent;
