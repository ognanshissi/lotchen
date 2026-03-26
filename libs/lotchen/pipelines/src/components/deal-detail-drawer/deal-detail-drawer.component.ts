import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TasCurrencyPipe } from '@talisoft/ui/currency-pipe';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DealsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasSpinner } from '@talisoft/ui/spinner';

@Component({
  selector: 'deal-detail-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [DatePipe, TasCurrencyPipe, TasIcon, ButtonModule, TasSpinner],
  template: `
    <div
      class="bg-white rounded-xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto"
    >
      @if (isLoading()) {
      <div class="flex items-center justify-center py-12">
        <tas-spinner></tas-spinner>
      </div>
      } @else if (deal()) {
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ deal().title }}
          </h2>
          <button
            tas-button
            iconButton
            color="neutral"
            size="small"
            (click)="dialogRef.close()"
          >
            <tas-icon iconName="feather:x"></tas-icon>
          </button>
        </div>
        <div class="flex items-center gap-3">
          @if (deal().amount) {
          <span class="text-lg font-bold text-primary">
            {{ deal().amount | tasCurrency : deal().currency }}
          </span>
          }
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full"
            [class]="getOutcomeClass(deal().outcome)"
          >
            {{ getOutcomeLabel(deal().outcome) }}
          </span>
        </div>
      </div>

      <!-- Info grid -->
      <div class="p-4 grid grid-cols-2 gap-4 border-b border-gray-200">
        <div>
          <div class="text-xs text-gray-500 mb-1">Contact</div>
          <div class="text-sm font-medium text-gray-900">
            {{ deal().contactName || '-' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Assigné à</div>
          <div class="text-sm font-medium text-gray-900">
            {{ deal().assignedToName || '-' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Clôture prévue</div>
          <div class="text-sm font-medium text-gray-900">
            {{
              deal().expectedCloseDate
                ? (deal().expectedCloseDate | date : 'dd/MM/yyyy')
                : '-'
            }}
          </div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">Créé le</div>
          <div class="text-sm font-medium text-gray-900">
            {{ deal().createdAt | date : 'dd/MM/yyyy' }}
          </div>
        </div>
      </div>

      <!-- Notes -->
      @if (deal().notes) {
      <div class="p-4 border-b border-gray-200">
        <div class="text-xs text-gray-500 mb-2">Notes</div>
        <p class="text-sm text-gray-700">{{ deal().notes }}</p>
      </div>
      }

      <!-- Stage history -->
      @if (deal().stageHistory?.length) {
      <div class="p-4 border-b border-gray-200">
        <div class="text-xs text-gray-500 mb-3">Historique des étapes</div>
        <div class="space-y-3">
          @for (entry of deal().stageHistory; track entry.stageId +
          entry.enteredAt) {
          <div class="flex items-start gap-3">
            <div
              class="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0"
            ></div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">
                {{ entry.stageName }}
              </div>
              <div class="text-xs text-gray-500">
                {{ entry.enteredAt | date : 'dd/MM/yyyy HH:mm' }}
                @if (entry.exitedAt) { —
                {{ entry.exitedAt | date : 'dd/MM/yyyy HH:mm' }}
                }
              </div>
            </div>
          </div>
          }
        </div>
      </div>
      }

      <!-- Actions -->
      <div class="flex items-center justify-between p-4">
        <div class="flex gap-2">
          @if (deal().outcome === 'open') {
          <button
            tas-raised-button
            color="primary"
            size="small"
            (click)="winDeal()"
          >
            <tas-icon iconName="feather:check-circle"></tas-icon>
            Gagné
          </button>
          <button
            tas-outlined-button
            color="neutral"
            size="small"
            (click)="loseDeal()"
          >
            <tas-icon iconName="feather:x-circle"></tas-icon>
            Perdu
          </button>
          }
        </div>
        <button
          tas-outlined-button
          color="neutral"
          size="small"
          (click)="deleteDeal()"
        >
          <tas-icon
            iconName="feather:trash-2"
            class="text-functional-error"
          ></tas-icon>
        </button>
      </div>
      }
    </div>
  `,
})
export class DealDetailDrawerComponent implements OnInit {
  readonly dialogRef = inject(DialogRef);
  private readonly _data = inject(DIALOG_DATA) as { dealId: string };
  private readonly _dealsApi = inject(DealsApiService);
  private readonly _snackbar = inject(SnackbarService);

  deal = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this._dealsApi.dealsControllerFindByIdV1(this._data.dealId).subscribe({
      next: (d) => {
        this.deal.set(d);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error('Erreur', 'Deal introuvable');
        this.dialogRef.close();
      },
    });
  }

  winDeal(): void {
    this._dealsApi.dealsControllerWinV1(this._data.dealId).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Deal marqué comme gagné');
        this.dialogRef.close('refresh');
      },
      error: (err) => {
        this._snackbar.error('Erreur', err?.error?.message || 'Erreur');
      },
    });
  }

  loseDeal(): void {
    this._dealsApi
      .dealsControllerLoseV1(this._data.dealId, { lostReason: '' })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Deal marqué comme perdu');
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this._snackbar.error('Erreur', err?.error?.message || 'Erreur');
        },
      });
  }

  deleteDeal(): void {
    this._dealsApi.dealsControllerDeleteV1(this._data.dealId).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Deal supprimé');
        this.dialogRef.close('refresh');
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors de la suppression');
      },
    });
  }

  getOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'won':
        return 'bg-functional-success/10 text-functional-success';
      case 'lost':
        return 'bg-functional-error/10 text-functional-error';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  }

  getOutcomeLabel(outcome: string): string {
    switch (outcome) {
      case 'won':
        return 'Gagné';
      case 'lost':
        return 'Perdu';
      default:
        return 'En cours';
    }
  }
}
