import { Component, inject, signal } from '@angular/core';
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
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';

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
export class ContactListingComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _contactsApiService = inject(ContactsApiService);
  private readonly _callerService = inject(CallerService);
  private readonly _addTaskDialogService = inject(AddTaskDialogService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);

  public contacts = apiResources(
    this._contactsApiService.contactsControllerFindAllContactsV1()
  );

  public selectedItems = signal<FindAllContactsQueryResponse[]>([]);

  public openCaller(item: FindAllContactsQueryResponse) {
    this._callerService.openCaller({
      id: item.id,
      clientName: `${item.firstName} ${item.lastName?.toUpperCase()}`,
      mobileNumber: item.mobileNumber ?? '',
    });
  }

  public handleSelectionItems(event: unknown[]) {
    this.selectedItems.set(event as FindAllContactsQueryResponse[]);
  }

  public openQuickAdd(): void {
    this._sideDrawerService.open(QuickAddComponent).closed.subscribe((res) => {
      console.log(res);
    });
  }

  public openImportContactDialog(): void {
    this._sideDrawerService
      .open(ImportContactDialogComponent)
      .closed.subscribe((result) => {
        if (result === 'imported') {
          this.refreshContacts();
        }
      });
  }

  public openAddTask(contactId: string): void {
    this._addTaskDialogService.open({
      relatedId: contactId,
      relatedType: 'Contact',
    });
  }

  public deleteContact(item: FindAllContactsQueryResponse): void {
    const dialogRef = this._dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Supprimer le contact',
        message: `Êtes-vous sûr de vouloir supprimer ${item.firstName} ${item.lastName} ? Cette action est irréversible.`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this._contactsApiService
          .contactsControllerDeleteContactV1(item.id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Contact supprimé avec succès');
              this.refreshContacts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer le contact'
              );
            },
          });
      }
    });
  }

  public bulkDeleteContacts(): void {
    const items = this.selectedItems();
    const dialogRef = this._dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Supprimer les contacts',
        message: `Êtes-vous sûr de vouloir supprimer ${items.length} contact(s) ? Cette action est irréversible.`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        const ids = items.map((i) => i.id);
        this._contactsApiService
          .contactsControllerBulkDeleteContactsV1({ ids })
          .subscribe({
            next: () => {
              this._snackbar.success(
                'Succès',
                `${items.length} contact(s) supprimé(s) avec succès`
              );
              this.selectedItems.set([]);
              this.refreshContacts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer les contacts'
              );
            },
          });
      }
    });
  }

  private refreshContacts(): void {
    this.contacts = apiResources(
      this._contactsApiService.contactsControllerFindAllContactsV1()
    );
  }

  /**
   *
   * @param message
   */
  public showBrowserNotification(message: string): void {
    console.log('Checking notification permission...', Notification.permission);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CRM Notification', {
        body: message,
      });
    }
  }
}

export default ContactListingComponent;
