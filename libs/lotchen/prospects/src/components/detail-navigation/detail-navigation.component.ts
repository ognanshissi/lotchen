import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CallerService } from '@lotchen/lotchen/common/components/caller/caller.service';
import {
  ContactsApiService,
  FindContactByIdQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { map } from 'rxjs';
import { MenuItem } from '@lotchen/lotchen/common/models/menu-item';
import { AddTaskDialogService } from '@lotchen/lotchen/common/components';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import {
  Menu,
  MenuItem as TasMenuItem,
  TasMenuTrigger,
} from '@talisoft/ui/menu';

@Component({
  selector: 'prospects-detail-navigation',
  templateUrl: './detail-navigation.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    TasCard,
    TasIcon,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    Menu,
    TasMenuItem,
    TasMenuTrigger,
  ],
  styles: [
    `
      .is-link-active {
        background-color: rgba(var(--tas-color-primary), 0.2);
        @apply text-primary;
      }
    `,
  ],
})
export class DetailNavigationComponent {
  private readonly _callerService = inject(CallerService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _taskDialogService = inject(AddTaskDialogService);
  private readonly _contactsApiService = inject(ContactsApiService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _router = inject(Router);

  public menuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: 'info',
      route: 'overview',
      active: true,
    },
    {
      label: 'Activities',
      icon: 'feather:activity',
      route: 'activities',
      active: true,
    },
    {
      label: 'Notes',
      icon: 'note',
      route: 'notes',
      active: true,
    },
    {
      label: "Journal d'appels",
      icon: 'feather:phone',
      route: 'call-logs',
      active: true,
    },
    {
      label: 'Documents',
      icon: 'feather:folder',
      route: 'documents',
      active: true,
    },
  ];

  public contact = toSignal(
    this._activatedRoute.data.pipe(
      map(
        (data) =>
          data['contact'] as FindContactByIdQueryResponse & Record<string, any>
      )
    )
  );

  public callerIsOpened = this._callerService.isCallerOpened;
  /**
   * Open caller dialog
   */
  public triggerCaller(): void {
    this._callerService.openCaller({
      id: this.contact()?.id ?? '',
      clientName: `${
        this.contact()?.firstName
      } ${this.contact()?.lastName?.toUpperCase()}`,
      mobileNumber: this.contact()?.mobileNumber ?? '',
    });
  }

  public openAddTaskDialog(): void {
    this._taskDialogService.open({
      relatedId: this.contact()?.id ?? '',
      relatedType: 'contact',
    });
  }

  public archiveContact(): void {
    const contact = this.contact();
    if (!contact) return;

    const dialogRef = this._dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: 'Archiver le contact',
        message: `Êtes-vous sûr de vouloir archiver ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this._contactsApiService
          .contactsControllerDeleteContactV1(contact.id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Contact archivé avec succès');
              this._router.navigate(['/portal/contacts']);
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                "Impossible d'archiver le contact"
              );
            },
          });
      }
    });
  }
}
