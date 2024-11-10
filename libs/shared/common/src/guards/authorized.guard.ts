import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services';
import { map } from 'rxjs';

export const authorized: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
  console.log('Guard');
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);
  return authenticationService.verifyToken().pipe(
    map((res) => {
      if (!res) {
        const redirectPath = state.url ?? '/portal/dashboard';
        router.navigate(['/auth', 'login'], { queryParams: { redirectPath } });
        return false;
      }
      return true;
    })
  );
};

export const noAuthorized: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);
  return authenticationService.verifyToken().pipe(
    map((res) => {
      if (res) {
        const redirectPath =  '/portal/dashboard';
        router.navigate([redirectPath]);
        return false;
      }
      return true;
    })
  );
}
