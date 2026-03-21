import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTable } from '@talisoft/ui/table';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { Menu, TasMenuTrigger, MenuItem } from '@talisoft/ui/menu';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';
import { MessageTemplatesApiService } from '@talisoft/api/lotchen-client-api';
import { finalize } from 'rxjs';

@Component({
  selector: 'campaigns-template-listing',
  standalone: true,
  templateUrl: './template-listing.component.html',
  imports: [
    RouterLink,
    TasTitle,
    TasText,
    TasCard,
    TasCardHeader,
    TasIcon,
    ButtonModule,
    TasTable,
    TimeagoPipe,
    Menu,
    TasMenuTrigger,
    MenuItem,
  ],
})
export class TemplateListingComponent implements OnInit {
  private readonly _templatesApi = inject(MessageTemplatesApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmDialog = inject(ConfirmDialogService);

  public templates = signal<any[]>([]);
  public isLoading = signal(false);
  public activeChannel = signal<string | undefined>(undefined);

  public ngOnInit(): void {
    this.loadTemplates();
  }

  public loadTemplates(): void {
    this.isLoading.set(true);
    this._templatesApi
      .messageTemplatesControllerFindAllV1(this.activeChannel() ?? '')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.templates.set(data),
        error: () =>
          this._snackbar.error('Erreur', 'Impossible de charger les templates'),
      });
  }

  public filterByChannel(channel?: string): void {
    this.activeChannel.set(channel);
    this.loadTemplates();
  }

  public deleteTemplate(item: any): void {
    this._confirmDialog.confirm({
      title: 'Supprimer le template',
      message: `Êtes-vous sûr de vouloir supprimer le template "${item.name}" ?`,
      closable: true,
      showCancelButton: true,
      acceptButtonProps: { label: 'Oui, Supprimer', icon: 'delete' },
      accept: () => {
        this._templatesApi
          .messageTemplatesControllerDeleteV1(item._id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Template supprimé');
              this.loadTemplates();
            },
            error: () =>
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer le template'
              ),
          });
      },
    });
  }

  public duplicateTemplate(item: any): void {
    const payload = {
      name: `${item.name} (copie)`,
      channel: item.channel,
      subject: item.subject,
      body: item.body,
      category: item.category,
      mergeFields: item.mergeFields,
    };
    this._templatesApi.messageTemplatesControllerCreateV1(payload).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Template dupliqué');
        this.loadTemplates();
      },
      error: () =>
        this._snackbar.error('Erreur', 'Impossible de dupliquer le template'),
    });
  }

  public getChannelLabel(channel: string): string {
    switch (channel) {
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return channel;
    }
  }

  public getChannelIcon(channel: string): string {
    switch (channel) {
      case 'email':
        return 'feather:mail';
      case 'sms':
        return 'feather:message-square';
      case 'whatsapp':
        return 'feather:message-circle';
      default:
        return 'feather:send';
    }
  }
}

export default TemplateListingComponent;
