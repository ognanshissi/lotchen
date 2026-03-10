import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TasDatePicker } from '@talisoft/ui/date-picker';
import { AuthenticationService } from '../../services/authentication.service';
import {
  MeetingsApiService,
  EventTypesApiService,
  FindAllEventTypesQueryResponse,
  ConflictingMeetingResponse,
} from '@talisoft/api/lotchen-client-api';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';

export interface AddMeetingDialogData {
  relatedId: string;
  relatedType: string;
  prefillDate?: string;
  prefillTime?: string;
}

@Component({
  selector: 'common-add-meeting-dialog',
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
    ReactiveFormsModule,
    TasDatePicker,
  ],
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Planifier un événement</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <form [formGroup]="form">
          <div class="text-primary">
            Associé a :
            <span class="bg-gray-300 px-3 py-1 rounded-full"
              >{{ currentUser()?.firstName }}
              {{ currentUser()?.lastName }}</span
            >
          </div>

          <div class="mt-5 flex flex-col space-y-3">
            <!-- Event Type -->
            <tas-form-field>
              <tas-label>Type d'événement</tas-label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                formControlName="eventTypeId"
                (change)="onEventTypeChange()"
              >
                <option value="">-- Choisir --</option>
                @for (et of eventTypes(); track et.id) {
                <option [value]="et.id">{{ et.name }}</option>
                }
              </select>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Titre</tas-label>
              <input
                tasInput
                type="text"
                formControlName="title"
                placeholder="Titre de l'événement"
              />
            </tas-form-field>

            <div class="flex justify-between space-x-3">
              <tas-date-picker formControlName="startAtDate">
                Date de début
              </tas-date-picker>
              <tas-date-picker mode="time" formControlName="startAtTime">
                Heure de début
              </tas-date-picker>
            </div>

            <div class="flex justify-between space-x-3">
              <tas-date-picker formControlName="endAtDate">
                Date de fin
              </tas-date-picker>
              <tas-date-picker mode="time" formControlName="endAtTime">
                Heure de fin
              </tas-date-picker>
            </div>

            <tas-form-field>
              <tas-label>Lieu</tas-label>
              <input
                tasInput
                type="text"
                formControlName="location"
                placeholder="Lieu de l'événement"
              />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Description</tas-label>
              <textarea
                tasInput
                formControlName="description"
                placeholder="Description de l'événement"
              ></textarea>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Rappel</tas-label>
              <select
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                formControlName="reminderMinutesBefore"
              >
                <option [ngValue]="null">Aucun</option>
                <option [ngValue]="5">5 minutes avant</option>
                <option [ngValue]="10">10 minutes avant</option>
                <option [ngValue]="15">15 minutes avant</option>
                <option [ngValue]="30">30 minutes avant</option>
                <option [ngValue]="60">1 heure avant</option>
              </select>
            </tas-form-field>

            @if (conflicts().length > 0) {
            <div
              class="rounded-lg p-4 border border-red-300 bg-red-50 text-red-700"
            >
              <strong>Conflit détecté !</strong>
              {{ conflicts().length }} événement(s) en conflit : @for (c of
              conflicts(); track c.id) {
              <div>
                {{ c.title }} ({{ $any(c.startAt)?.time }} -
                {{ $any(c.endAt).time }})
              </div>
              }
            </div>
            }
          </div>
        </form>
      </tas-drawer-content>

      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
        <button tas-raised-button color="primary" (click)="handleSubmit()">
          <tas-icon iconName="feather:check"></tas-icon>
          Sauvegarder
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class AddMeetingDialogComponent implements OnInit {
  private readonly _authService = inject(AuthenticationService);
  private readonly _meetingsApi = inject(MeetingsApiService);
  private readonly _eventTypesApi = inject(EventTypesApiService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _data: AddMeetingDialogData = inject(DIALOG_DATA);

  public readonly currentUser = computed(() =>
    this._authService.connectedUser()
  );

  public eventTypes = signal<FindAllEventTypesQueryResponse[]>([]);
  public conflicts = signal<ConflictingMeetingResponse[]>([]);
  public form!: FormGroup;

  public ngOnInit(): void {
    this.form = new FormGroup({
      eventTypeId: new FormControl(''),
      title: new FormControl(null, [Validators.required]),
      startAtDate: new FormControl(this._data.prefillDate ?? null, [
        Validators.required,
      ]),
      startAtTime: new FormControl(this._data.prefillTime ?? null, [
        Validators.required,
      ]),
      endAtDate: new FormControl(this._data.prefillDate ?? null),
      endAtTime: new FormControl(null),
      location: new FormControl(null),
      description: new FormControl(null),
      reminderMinutesBefore: new FormControl(null),
    });

    this._eventTypesApi.eventTypesControllerFindAllEventTypesV1().subscribe({
      next: (types) => this.eventTypes.set(types),
    });
  }

  public onEventTypeChange(): void {
    const eventTypeId = this.form.get('eventTypeId')?.value;
    const et = this.eventTypes().find((t) => t.id === eventTypeId);
    if (et && this.form.get('startAtTime')?.value) {
      // Auto-fill end time based on default duration
      const startTime = this.form.get('startAtTime')?.value as string;
      if (startTime) {
        const [h, m] = startTime.split(':').map(Number);
        const endMinutes = h * 60 + m + et.defaultDurationMinutes;
        const endH = Math.floor(endMinutes / 60)
          .toString()
          .padStart(2, '0');
        const endM = (endMinutes % 60).toString().padStart(2, '0');
        this.form.get('endAtTime')?.setValue(`${endH}:${endM}`);
      }
    }
  }

  public handleSubmit(): void {
    if (this.form.invalid) return;
    const values = this.form.getRawValue();

    // Check conflicts before submitting
    const userId = this.currentUser()?.userId;
    if (
      userId &&
      values.startAtDate &&
      values.startAtTime &&
      values.endAtDate &&
      values.endAtTime
    ) {
      this._meetingsApi
        .meetingsControllerCheckConflictsV1(
          userId,
          values.startAtDate,
          values.startAtTime,
          values.endAtDate,
          values.endAtTime
        )
        .subscribe({
          next: (conflicts) => {
            this.conflicts.set(conflicts);
            if (conflicts.length === 0) {
              this.createMeeting(values);
            }
            // If conflicts exist, they are shown as a warning; user can still submit again
          },
          error: () => this.createMeeting(values),
        });
    } else {
      this.createMeeting(values);
    }
  }

  private createMeeting(values: any): void {
    const payload = {
      title: values.title,
      startAtDate: values.startAtDate,
      startAtTime: values.startAtTime,
      endAtDate: values.endAtDate ?? values.startAtDate,
      endAtTime: values.endAtTime ?? values.startAtTime,
      location: values.location ?? '',
      description: values.description ?? '',
      attendees: [],
      meetingTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ownerId: this.currentUser()?.userId ?? '',
      relatedToId: this._data.relatedId,
      relatedToType: this._data.relatedType ?? 'Meeting',
      eventTypeId: values.eventTypeId || undefined,
      reminderMinutesBefore: values.reminderMinutesBefore,
    };

    this._meetingsApi
      .meetingsControllerCreateMeetingV1(payload as any)
      .subscribe({
        next: () => {
          this._dialogRef.close(true);
          this._snackbar.success('Succès', 'Événement planifié');
        },
        error: () => {
          this._snackbar.error('Erreur', "Impossible de planifier l'événement");
        },
      });
  }
}
