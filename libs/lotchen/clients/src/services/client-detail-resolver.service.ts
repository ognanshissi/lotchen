import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
} from '@angular/router';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { catchError, EMPTY } from 'rxjs';
import { ClientDetailDto, ClientsApiService } from './clients-api.service';

export const clientDetailResolver: ResolveFn<ClientDetailDto> = (
  route: ActivatedRouteSnapshot
): MaybeAsync<ClientDetailDto | RedirectCommand> => {
  const clientsApi = inject(ClientsApiService);
  const snackbar = inject(SnackbarService);

  return clientsApi.findById(route.paramMap.get('id') ?? '').pipe(
    catchError(() => {
      snackbar.error(
        'Attention!',
        'Le client est inaccessible présentement, réessayer plus tard'
      );
      return EMPTY;
    })
  );
};
