import {
  ActivatedRouteSnapshot,
  MaybeAsync,
  RedirectCommand,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import {
  FindUserByIdQueryResponse,
  GetUserProfileQueryResponse,
  ProfileApiService,
  UsersApiService,
} from '@talisoft/api/lotchen-client-api';
import { inject } from '@angular/core';
import { catchError, EMPTY, forkJoin, map } from 'rxjs';
import { SnackbarService } from '@talisoft/ui/snackbar';

export interface UserDetailResolver {
  user: FindUserByIdQueryResponse;
  profile: GetUserProfileQueryResponse;
}

export const userDetailResolverService: ResolveFn<UserDetailResolver> = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): MaybeAsync<UserDetailResolver | RedirectCommand> => {
  const usersApiService = inject(UsersApiService);
  const profileApiService = inject(ProfileApiService);

  const snackbar = inject(SnackbarService);

  return forkJoin([
    usersApiService.usersControllerFindUserByIdV1(
      route.paramMap.get('id') ?? ''
    ),
    profileApiService.profileControllerFindUserByIdV1(
      route.paramMap.get('id') ?? ''
    ),
  ]).pipe(
    map((response) => ({
      user: response[0],
      profile: response[1],
    })),
    catchError(() => {
      snackbar.error(
        'Attention!',
        "L'utilisateur est inaccessible présentement, reéssayer plutard"
      );
      return EMPTY;
    })
  );
};
