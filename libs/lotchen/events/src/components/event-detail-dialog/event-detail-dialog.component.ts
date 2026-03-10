import { Component, inject, signal } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  MeetingsApiService,
  FindMeetingsByRangeResponse,
  FindAllEventTypesQueryResponse,
  SetMeetingOutcomeCommandOutcomeEnum,
} from '@talisoft/api/lotchen-client-api';

export interface EventDetailDialogData {
  event: FindMeetingsByRangeResponse;
  eventTypes: FindAllEventTypesQueryResponse[];
}

const STATUS_LABELS: Record<string, string> = {
  Scheduled: 'Programmé',
  Completed: 'Terminé',
  Cancelled: 'Annulé',
  NoShow: 'Absent',
  Rescheduled: 'Reprogrammé',
};

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  NoShow: 'bg-red-100 text-red-800',
  Rescheduled: 'bg-yellow-100 text-yellow-800',
};

@Component({
  selector: 'events-event-detail-dialog',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    ButtonModule,
    FormField,
    TasInput,
    TasLabel,
    FormsModule,
  ],
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <div class="flex items-center gap-3">
          @if (eventType()) {
          <tas-icon
            [iconName]="eventType()!.icon"
            [style.color]="eventType()!.color"
          ></tas-icon>
          }
          <tas-title>{{ data.event.title }}</tas-title>
        </div>
      </tas-drawer-title>
      <tas-drawer-content>
        <div class="space-y-4">
          <!-- Status badge -->
          <div>
            <span
              class="text-xs px-3 py-1 rounded-full font-medium"
              [class]="getStatusColor(data.event.status)"
            >
              {{ getStatusLabel(data.event.status) }}
            </span>
          </div>

          <!-- Event details -->
          <div class="space-y-3 text-sm">
            @if (eventType()) {
            <div class="flex items-center gap-2 text-gray-600">
              <tas-icon iconName="feather:tag" class="text-gray-400"></tas-icon>
              {{ eventType()!.name }}
            </div>
            }
            <div class="flex items-center gap-2 text-gray-600">
              <tas-icon
                iconName="feather:calendar"
                class="text-gray-400"
              ></tas-icon>
              {{ formatDate($any(data.event.startAt).date) }}
              {{ $any(data.event.startAt).time }} -
              {{ $any(data.event.endAt).time }}
            </div>
            @if (data.event.location) {
            <div class="flex items-center gap-2 text-gray-600">
              <tas-icon
                iconName="feather:map-pin"
                class="text-gray-400"
              ></tas-icon>
              {{ data.event.location }}
            </div>
            } @if (data.event.description) {
            <div class="flex gap-2 text-gray-600">
              <tas-icon
                iconName="feather:align-left"
                class="text-gray-400 mt-0.5"
              ></tas-icon>
              <span>{{ data.event.description }}</span>
            </div>
            }
          </div>

          <!-- Outcome section (only if scheduled) -->
          @if (data.event.status === 'Scheduled') {
          <div class="border-t border-gray-200 pt-4 mt-4">
            <p class="font-semibold mb-3">Enregistrer le résultat</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                tas-outlined-button
                class="!justify-start"
                (click)="setOutcome('completed')"
              >
                <tas-icon iconName="feather:check-circle"></tas-icon>
                Terminé
              </button>
              <button
                tas-outlined-button
                class="!justify-start"
                (click)="setOutcome('no-show')"
              >
                <tas-icon iconName="feather:user-x"></tas-icon>
                Absent
              </button>
              <button
                tas-outlined-button
                class="!justify-start"
                (click)="setOutcome('rescheduled')"
              >
                <tas-icon iconName="feather:rotate-cw"></tas-icon>
                Reprogrammer
              </button>
              <button
                tas-outlined-button
                class="!justify-start"
                (click)="setOutcome('cancelled')"
              >
                <tas-icon iconName="feather:x-circle"></tas-icon>
                Annuler
              </button>
            </div>

            @if (showOutcomeNotes()) {
            <div class="mt-3">
              <tas-form-field>
                <tas-label>Notes sur le résultat</tas-label>
                <textarea
                  tasInput
                  [(ngModel)]="outcomeNotes"
                  placeholder="Ajouter des notes..."
                ></textarea>
              </tas-form-field>
              <div class="flex gap-2 mt-2">
                <button
                  tas-raised-button
                  color="primary"
                  (click)="confirmOutcome()"
                >
                  Confirmer
                </button>
                <button
                  tas-outlined-button
                  (click)="showOutcomeNotes.set(false)"
                >
                  Annuler
                </button>
              </div>
            </div>
            }
          </div>
          }

          <!-- Follow-up action -->
          @if (data.event.status !== 'Scheduled') {
          <div class="border-t border-gray-200 pt-4">
            <button
              tas-outlined-button
              color="primary"
              (click)="scheduleFollowUp()"
            >
              <tas-icon iconName="feather:plus"></tas-icon>
              Programmer un suivi
            </button>
          </div>
          }
        </div>
      </tas-drawer-content>

      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class EventDetailDialogComponent {
  private readonly _meetingsApi = inject(MeetingsApiService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: EventDetailDialogData = inject(DIALOG_DATA);

  public showOutcomeNotes = signal(false);
  public outcomeNotes = '';
  private _selectedOutcome:
    | 'completed'
    | 'no-show'
    | 'rescheduled'
    | 'cancelled' = 'completed';

  public eventType = signal<FindAllEventTypesQueryResponse | undefined>(
    this.data.eventTypes.find((et) => et.id === this.data.event.eventTypeId)
  );

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  setOutcome(
    outcome: 'completed' | 'no-show' | 'rescheduled' | 'cancelled'
  ): void {
    this._selectedOutcome = outcome;
    this.showOutcomeNotes.set(true);
  }

  confirmOutcome(): void {
    this._meetingsApi
      .meetingsControllerSetOutcomeV1(this.data.event.id, {
        outcome: this._selectedOutcome as SetMeetingOutcomeCommandOutcomeEnum,
        outcomeNotes: this.outcomeNotes,
      })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Résultat enregistré');
          this._dialogRef.close(true);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            "Impossible d'enregistrer le résultat"
          );
        },
      });
  }

  scheduleFollowUp(): void {
    this._dialogRef.close({ action: 'follow-up', event: this.data.event });
  }
}
