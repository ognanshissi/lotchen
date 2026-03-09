import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT_CONFIG } from '../utils/environment-config.token';
import { HttpClient } from '@angular/common/http';
import { ImportSummary } from '../models/import-summary';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private readonly _environment = inject(ENVIRONMENT_CONFIG);
  private readonly _http = inject(HttpClient);

  public importContacts(formData: FormData): Observable<ImportSummary> {
    return this._http.post<ImportSummary>(
      `${this._environment.apiUrl}/api/v1/contacts/import-excel`,
      formData
    );
  }
}
