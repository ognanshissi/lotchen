import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { signal, Signal } from '@angular/core';

export interface ApiResourcesResponse<TResponse> {
  isLoading: boolean;
  value: TResponse | null;
  error: HttpErrorResponse | null;
}

export function apiResources<TResponse>(
  obs$: Observable<TResponse>
): Signal<ApiResourcesResponse<TResponse>> {
  const response = signal<ApiResourcesResponse<TResponse>>({
    isLoading: true,
    value: null,
    error: null,
  });

  obs$.subscribe({
    next: (res) => {
      response.set({
        isLoading: false,
        value: res,
        error: null,
      });
    },
    error: (err) => {
      response.set({
        isLoading: false,
        error: err,
        value: null,
      });
    },
  });

  return response;
}
