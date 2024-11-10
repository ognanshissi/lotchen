import { inject, Injectable, signal } from '@angular/core';
import {
  AccessTokenResponse,
  IdentityApiService,
  LoginRequest,
  RefreshRequest,
} from '@talisoft/api';
import { concat, filter, interval, Observable, tap, timer } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const TOKEN_STORAGE_KEY = 'LOTCHEN_ACCESS_TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly _identityApiService = inject(IdentityApiService);

  // User signals
  private readonly _connectedUser = signal<unknown | null>(null);
  public connectedUser = this._connectedUser.asReadonly();

  // Access token
  private readonly _accessToken = signal<string | null>(null);
  public accessToken = this._accessToken.asReadonly();

  // loading states
  private readonly _loadingUserInfo = signal<boolean>(false);
  public loadingUserInfo = this._loadingUserInfo.asReadonly();

  // Errors
  private readonly _errorMessage = signal<unknown | null>(null);
  public errorMessage = this._errorMessage.asReadonly();

  private tokenExpiresIn = signal<number>(0);

  constructor() {
    concat(
      toObservable(this.tokenExpiresIn).pipe(filter((value) => value > 0)),
      timer(this.tokenExpiresIn()),
      interval(1000)
    ).subscribe((res) => console.log(`Next => `, res));
  }

  public login(loginRequest: LoginRequest): Observable<AccessTokenResponse> {
    return this._identityApiService.loginPost(false, false, loginRequest).pipe(
      tap((accessToken) => {
        this.tokenExpiresIn.set(Math.ceil(accessToken.expiresIn / 100));
        this._accessToken.set(accessToken.accessToken);
        localStorage.setItem(
          TOKEN_STORAGE_KEY,
          JSON.stringify(accessToken)
        );
      })
    );
  }

  public refreshToken(
    refreshRequest: RefreshRequest
  ): Observable<AccessTokenResponse> {
    return this._identityApiService.refreshPost(refreshRequest);
  }
}
