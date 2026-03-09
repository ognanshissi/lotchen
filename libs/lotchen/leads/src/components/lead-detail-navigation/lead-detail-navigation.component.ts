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
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { map } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { QualifyLeadDialogComponent } from '../qualify-lead-dialog/qualify-lead-dialog.component';
import { ConvertLeadDialogComponent } from '../convert-lead-dialog/convert-lead-dialog.component';
import {
  Menu,
  MenuItem as TasMenuItem,
  TasMenuTrigger,
} from '@talisoft/ui/menu';
import { LeadsApiService } from '@talisoft/api/lotchen-client-api';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'leads-detail-navigation',
  templateUrl: './lead-detail-navigation.component.html',
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
export class LeadDetailNavigationComponent {
  private readonly _callerService = inject(CallerService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _router = inject(Router);
  private readonly _leadsApiService = inject(LeadsApiService);

  public menuItems: MenuItem[] = [
    { label: 'Overview', icon: 'info', route: 'overview' },
  ];

  public lead = toSignal(
    this._activatedRoute.data.pipe(
      map((data) => data['lead'] as Record<string, any>)
    )
  );

  public callerIsOpened = this._callerService.isCallerOpened;

  public triggerCaller(): void {
    this._callerService.openCaller({
      id: this.lead()?.['id'] ?? '',
      clientName: `${this.lead()?.['firstName']} ${this.lead()?.[
        'lastName'
      ]?.toUpperCase()}`,
      mobileNumber: this.lead()?.['mobileNumber'] ?? '',
    });
  }

  public qualifyLead(): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    const dialogRef = this._dialog.open(QualifyLeadDialogComponent, {
      data: { leadId },
    });

    dialogRef.closed.subscribe((result) => {
      if (result === 'qualified') {
        this._refreshPage(leadId);
      }
    });
  }

  public convertLead(): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    const dialogRef = this._dialog.open(ConvertLeadDialogComponent, {
      data: { leadId },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this._router.navigate(['/portal/contacts', leadId, 'overview']);
      }
    });
  }

  public disqualifyLead(): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    const reason = prompt('Raison de la disqualification:');
    if (!reason) return;

    this._leadsApiService
      .leadsControllerDisqualifyLeadV1(leadId, { reason })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Lead disqualifié');
          this._refreshPage(leadId);
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de disqualifier le lead');
        },
      });
  }

  public archiveLead(): void {
    const lead = this.lead();
    if (!lead) return;

    if (
      !confirm(
        `Supprimer ${lead['firstName']} ${lead['lastName']} ? Cette action est irréversible.`
      )
    )
      return;

    this._leadsApiService.leadsControllerDeleteLeadV1(lead['id']).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Lead archivé avec succès');
        this._router.navigate(['/portal/leads']);
      },
      error: () => {
        this._snackbar.error('Erreur', "Impossible d'archiver le lead");
      },
    });
  }

  private _refreshPage(leadId: string): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/portal/leads', leadId, 'overview']);
    });
  }
}
