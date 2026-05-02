import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
} from '@angular/router';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { catchError, EMPTY } from 'rxjs';
import {
  ClientsApiService,
  FindClientByIdQueryResponse,
} from '@talisoft/api/lotchen-client-api';

export const clientDetailResolver: ResolveFn<FindClientByIdQueryResponse> = (
  route: ActivatedRouteSnapshot
): MaybeAsync<FindClientByIdQueryResponse | RedirectCommand> => {
  const clientsApi = inject(ClientsApiService);
  const snackbar = inject(SnackbarService);

  return clientsApi
    .clientControllerFindByIdV1(route.paramMap.get('id') ?? '')
    .pipe(
      catchError(() => {
        snackbar.error(
          'Attention!',
          'Le client est inaccessible présentement, réessayer plus tard'
        );
        return EMPTY;
      })
    );
};
