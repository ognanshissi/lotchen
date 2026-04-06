import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginateClientsRequest {
  pageIndex: number;
  pageSize: number;
  filters: Record<string, any>;
  fullTextSearch: string;
}

export interface ClientDto {
  id: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  status?: string;
  kycStatus?: string;
  accountType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginateClientsResponse {
  pageIndex: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  data: ClientDto[];
}

export interface ClientDetailDto {
  id: string;
  clientNumber: string;
  contactId: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle?: string;
  companyName?: string;
  addresses?: any[];
  source?: string;
  status: string;
  kycStatus: string;
  accountType: string;
  onboardingDate?: string;
  creditScore?: number;
  monthlyIncome?: any;
  employmentStatus?: string;
  assignedToUserId?: string;
  assignedToTeamId?: string;
  territoryId?: string;
  agencyId?: string;
  productIds?: string[];
  policyIds?: string[];
  tags?: string[];
  customFields?: Record<string, string>;
  notes?: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/v1/clients';

  paginate(
    request: PaginateClientsRequest
  ): Observable<PaginateClientsResponse> {
    return this._http.post<PaginateClientsResponse>(
      `${this._baseUrl}/paginate`,
      request
    );
  }

  findById(id: string): Observable<ClientDetailDto> {
    return this._http.get<ClientDetailDto>(`${this._baseUrl}/${id}`);
  }

  update(id: string, payload: Partial<ClientDetailDto>): Observable<void> {
    return this._http.patch<void>(`${this._baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }
}
