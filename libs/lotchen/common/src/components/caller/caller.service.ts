import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { CallerComponent } from './caller.component';

export interface CallerData {
  id: string;
  clientName: string;
  mobileNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class CallerService {
  private readonly _dialog = inject(Dialog);
  private readonly isCallerOpenedSubject$: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  public readonly isCallerOpened = this.isCallerOpenedSubject$.asObservable();

  /**
   * Handle caller dialog state
   * @param data
   */
  public openCaller(data: CallerData) {
    this.isCallerOpenedSubject$.next(true);
    this._dialog
      .open(CallerComponent, {
        hasBackdrop: false,
        data,
      })
      .closed.subscribe({
        next: () => this.isCallerOpenedSubject$.next(false),
      });
  }
}
