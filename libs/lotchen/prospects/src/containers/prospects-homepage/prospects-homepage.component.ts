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
import {
  ContactsApiService,
  FindAllContactsQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { RouterLink } from '@angular/router';
import { ImportContactDialogComponent } from '../../components/import-contact-dialog/import-contact-dialog.component';
import { CallerService } from '@lotchen/lotchen/common';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';

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
    RowSelectionItem,
    TimeagoPipe,
    RouterLink,
    Menu,
    TasMenuTrigger,
    MenuItem,
  ],
})
export class ProspectsHomepageComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _contactsApiService = inject(ContactsApiService);
  private readonly _callerService = inject(CallerService);

  public contacts = apiResources(
    this._contactsApiService.contactsControllerFindAllContactsV1()
  );

  public openCaller(item: FindAllContactsQueryResponse) {
    this._callerService.openCaller({
      id: item.id,
      clientName: `${item.lastName} ${item.firstName?.toUpperCase()}`,
      mobileNumber: item.mobileNumber ?? '',
    });
  }

  public handleSelectionItems(event: unknown[]) {
    console.log(event);
  }

  public openQuickAdd(): void {
    this._sideDrawerService.open(QuickAddComponent).closed.subscribe((res) => {
      console.log(res);
    });
  }

  public openImportContactDialog(): void {
    this._sideDrawerService
      .open(ImportContactDialogComponent, { width: '700px' })
      .closed.subscribe();
  }
}

export default ProspectsHomepageComponent;
