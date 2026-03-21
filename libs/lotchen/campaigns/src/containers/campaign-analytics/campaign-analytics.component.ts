import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTable } from '@talisoft/ui/table';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { CampaignsApiService } from '@talisoft/api/lotchen-client-api';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'campaigns-campaign-analytics',
  standalone: true,
  templateUrl: './campaign-analytics.component.html',
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
    DecimalPipe,
  ],
})
export class CampaignAnalyticsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _campaignsApi = inject(CampaignsApiService);
  private readonly _snackbar = inject(SnackbarService);

  public analytics = signal<any>(null);
  public isLoading = signal(false);

  public ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAnalytics(id);
    }
  }

  private loadAnalytics(id: string): void {
    this.isLoading.set(true);
    this._campaignsApi
      .campaignsControllerAnalyticsV1(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.analytics.set(data);
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de charger les analytics');
        },
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

  public getMessageStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'sent':
        return 'Envoyé';
      case 'delivered':
        return 'Livré';
      case 'bounced':
        return 'Rebondi';
      case 'opened':
        return 'Ouvert';
      case 'clicked':
        return 'Cliqué';
      case 'unsubscribed':
        return 'Désabonné';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  }

  public getFunnelWidth(value: number): string {
    const total = this.analytics()?.summary?.total || 1;
    return `${Math.max((value / total) * 100, 2)}%`;
  }
}

export default CampaignAnalyticsComponent;
