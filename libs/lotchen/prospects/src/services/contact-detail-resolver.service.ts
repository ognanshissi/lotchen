import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
} from '@angular/router';
import {
  ContactsApiService,
  FindContactByIdQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { catchError, EMPTY } from 'rxjs';

export const contactDetailResover: ResolveFn<FindContactByIdQueryResponse> = (
  route: ActivatedRouteSnapshot
): MaybeAsync<FindContactByIdQueryResponse | RedirectCommand> => {
  const contactApiService = inject(ContactsApiService);
  const snackbar = inject(SnackbarService);

  return contactApiService
    .contactsControllerFindContactByIdV1(route.paramMap.get('id') ?? '')
    .pipe(
      catchError(() => {
        snackbar.error(
          'Attention!',
          'Le contact est inaccessible présentement, reéssayer plutard'
        );
        return EMPTY;
      })
    );
};
