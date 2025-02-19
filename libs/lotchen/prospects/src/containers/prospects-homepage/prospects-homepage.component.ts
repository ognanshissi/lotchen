import { Component, inject } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { QuickAddComponent } from '../../components/quick-add/quick-add.component';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import {
  RowSelectionItem,
  RowSelectionMaster,
  TasTable,
} from '@talisoft/ui/table';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'prospects-homepage',
  standalone: true,
  templateUrl: './prospects-homepage.component.html',
  imports: [
    TasTitle,
    ButtonModule,
    TasIcon,
    TasText,
    TasCard,
    TasCardHeader,
    TasTable,
    RowSelectionMaster,
    DatePipe,
    RowSelectionItem,
  ],
})
export class ProspectsHomepageComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);

  public data = [
    {
      name: 'James Gordon',
      contact: '002250756789890',
      source: 'Site internet',
      status: 'Nouveau',
      createdAt: new Date(),
    },
  ];

  public handleSelectionItems(event: unknown[]) {
    console.log(event);
  }

  openQuickAdd() {
    this._sideDrawerService.open(QuickAddComponent).closed.subscribe((res) => {
      console.log(res);
    });
  }
}

export default ProspectsHomepageComponent;
