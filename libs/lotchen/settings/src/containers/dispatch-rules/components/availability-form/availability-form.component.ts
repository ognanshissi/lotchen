import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';
import { TasIcon } from '@talisoft/ui/icon';

export interface AvailabilityConfigValue {
  respectBusinessHours: boolean;
  timeZone: string;
  excludeOnLeave: boolean;
}

const DEFAULT: AvailabilityConfigValue = {
  respectBusinessHours: false,
  timeZone: 'UTC',
  excludeOnLeave: false,
};

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Africa/Abidjan', label: 'Africa/Abidjan (GMT)' },
  { value: 'Africa/Dakar', label: 'Africa/Dakar (GMT)' },
  { value: 'Africa/Douala', label: 'Africa/Douala (WAT)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
  { value: 'America/New_York', label: 'America/New_York (ET)' },
  { value: 'America/Chicago', label: 'America/Chicago (CT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dispatch-availability-form',
  templateUrl: './availability-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FormField, TasLabel, TasSelect, TasIcon],
})
export class AvailabilityFormComponent {
  public availability = input<AvailabilityConfigValue | null>(null);
  public availabilityChange = output<AvailabilityConfigValue>();

  public readonly timezones = TIMEZONES;

  private current(): AvailabilityConfigValue {
    return this.availability() ?? { ...DEFAULT };
  }

  public setField(field: keyof AvailabilityConfigValue, value: any): void {
    this.availabilityChange.emit({ ...this.current(), [field]: value });
  }

  public get respectBusinessHours(): boolean {
    return this.current().respectBusinessHours;
  }

  public get timeZone(): string {
    return this.current().timeZone;
  }

  public get excludeOnLeave(): boolean {
    return this.current().excludeOnLeave;
  }
}
