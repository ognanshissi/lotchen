import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { CallerService } from '@lotchen/lotchen/common/components/caller/caller.service';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';
import { AddTaskDialogService } from '@lotchen/lotchen/common/components/add-task-dialog';
import { ContactStreamService } from '../../services/contact-stream.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'prospects-contact-listing',
  standalone: true,
  templateUrl: './contact-listing.component.html',
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
export class ContactListingComponent implements OnInit, OnDestroy {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _contactsApiService = inject(ContactsApiService);
  private readonly _callerService = inject(CallerService);
  private readonly _addTaskDialogService = inject(AddTaskDialogService);
  private readonly _contactStreamService = inject(ContactStreamService);

  public contacts = apiResources(
    this._contactsApiService.contactsControllerFindAllContactsV1()
  );

  private subscription: Subscription | null = null;

  public ngOnInit(): void {
    this.subscription = this._contactStreamService
      .getContactStream()
      .subscribe({
        next: (contactUpdate) => {
          console.log('Contact update received in component:', contactUpdate);
          // Here you would typically update the contacts list accordingly
        },
        error: (error) => {
          console.error('Error in contact stream:', error);
        },
      });
  }

  public openCaller(item: FindAllContactsQueryResponse) {
    this._callerService.openCaller({
      id: item.id,
      clientName: `${item.firstName} ${item.lastName?.toUpperCase()}`,
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

  public openAddTask(contactId: string): void {
    this._addTaskDialogService.open({
      relatedId: contactId,
    });
  }

  public showBrowserNotification(message: string): void {
    console.log('Checking notification permission...', Notification.permission);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CRM Notification', {
        body: message,
      });
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

export default ContactListingComponent;
