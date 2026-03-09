import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { catchError, EMPTY } from 'rxjs';
import { LeadsApiService } from '@talisoft/api/lotchen-client-api';

export const leadDetailResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot
): MaybeAsync<any | RedirectCommand> => {
  const leadsApiService = inject(LeadsApiService);
  const snackbar = inject(SnackbarService);

  const id = route.paramMap.get('id') ?? '';

  return leadsApiService.leadsControllerFindLeadByIdV1(id).pipe(
    catchError(() => {
      snackbar.error(
        'Attention!',
        'Le lead est inaccessible présentement, réessayez plus tard'
      );
      return EMPTY;
    })
  );
};
