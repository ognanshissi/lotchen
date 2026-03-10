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
import { TasSelect } from '@talisoft/ui/select';

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
    TasSelect,
  ],
  templateUrl: 'add-meeting-dialog.component.html',
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

  public readonly reminderMinutesBeforeOptions = signal([
    { value: null, label: 'Aucun' },
    { value: 5, label: '5 minutes avant' },
    { value: 10, label: '10 minutes avant' },
    { value: 15, label: '15 minutes avant' },
    { value: 30, label: '30 minutes avant' },
    { value: 60, label: '1 heure avant' },
  ]);

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
      next: (types) => {
        console.log(types);
        this.eventTypes.set(types);
        if (types.length > 0) {
          this.form.get('eventTypeId')?.setValue(types[0].id);
          this.onEventTypeChange();
        }
      },
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
