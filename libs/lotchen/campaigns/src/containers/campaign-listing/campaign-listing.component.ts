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
import { CampaignsApiService } from '@talisoft/api/lotchen-client-api';
import { finalize } from 'rxjs';

@Component({
  selector: 'campaigns-campaign-listing',
  standalone: true,
  templateUrl: './campaign-listing.component.html',
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
export class CampaignListingComponent implements OnInit {
  private readonly _campaignsApi = inject(CampaignsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmDialog = inject(ConfirmDialogService);

  public campaigns = signal<any[]>([]);
  public isLoading = signal(false);

  public ngOnInit(): void {
    this.loadCampaigns();
  }

  public loadCampaigns(): void {
    this.isLoading.set(true);
    this._campaignsApi
      .campaignsControllerFindAllV1()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.campaigns.set(data),
        error: () =>
          this._snackbar.error('Erreur', 'Impossible de charger les campagnes'),
      });
  }

  public deleteCampaign(item: any): void {
    this._confirmDialog.confirm({
      title: 'Supprimer la campagne',
      message: `Êtes-vous sûr de vouloir supprimer la campagne "${item.name}" ?`,
      closable: true,
      showCancelButton: true,
      acceptButtonProps: { label: 'Supprimer', icon: 'delete' },
      accept: () => {
        this._campaignsApi.campaignsControllerDeleteV1(item._id).subscribe({
          next: () => {
            this._snackbar.success('Succès', 'Campagne supprimée');
            this.loadCampaigns();
          },
          error: () =>
            this._snackbar.error(
              'Erreur',
              'Impossible de supprimer la campagne'
            ),
        });
      },
    });
  }

  public sendCampaign(item: any): void {
    this._confirmDialog.confirm({
      title: 'Envoyer la campagne',
      message: `Êtes-vous sûr de vouloir envoyer la campagne "${item.name}" ?`,
      closable: true,
      showCancelButton: true,
      acceptButtonProps: { label: 'Envoyer', icon: 'send' },
      accept: () => {
        this._campaignsApi.campaignsControllerSendV1(item._id).subscribe({
          next: (result) => {
            this._snackbar.success(
              'Succès',
              `Campagne en cours d'envoi à ${result.audienceCount} contact(s)`
            );
            this.loadCampaigns();
          },
          error: () =>
            this._snackbar.error('Erreur', "Impossible d'envoyer la campagne"),
        });
      },
    });
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

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'scheduled':
        return 'Planifiée';
      case 'sending':
        return 'En cours';
      case 'sent':
        return 'Envoyée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  }

  public getDeliveryRate(item: any): string {
    if (!item.stats?.total || item.stats.total === 0) return '-';
    const rate = (item.stats.delivered / item.stats.total) * 100;
    return `${rate.toFixed(0)}%`;
  }
}

export default CampaignListingComponent;
