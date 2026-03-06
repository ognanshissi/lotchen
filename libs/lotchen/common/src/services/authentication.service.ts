import { afterNextRender, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import {
  AccessTokenResponse,
  AuthApiService,
  GetMeQueryResponse,
  LoginCommand,
  RefreshTokenCommand,
  VerifyTokenQueryResponse,
} from '@talisoft/api/lotchen-client-api';

export const TOKEN_STORAGE_KEY = 'LOTCHEN_ACCESS_TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private storage: Storage = window.localStorage;

  private readonly _authService = inject(AuthApiService);
  private readonly _router = inject(Router);
  // User signals
  private readonly _connectedUser = signal<GetMeQueryResponse | null>(null);
  public connectedUser = this._connectedUser.asReadonly();

  // Access token
  private readonly _accessToken = signal<string | null>(null);
  public accessToken = this._accessToken.asReadonly();

  // loading states
  private readonly _loadingUserInfo = signal<boolean>(false);
  public loadingUserInfo = this._loadingUserInfo.asReadonly();

  // Errors
  private readonly _errorMessage = signal<string | null>(null);
  public errorMessage = this._errorMessage.asReadonly();

  private tokenExpiresIn = signal<number>(0);

  public constructor() {
    afterNextRender(() => {
      this.storage = window.localStorage;
    });
  }

  public login(loginRequest: LoginCommand): Observable<AccessTokenResponse> {
    this._errorMessage.set(null);
    this._connectedUser.set(null);
    return this._authService.authControllerLoginV1(loginRequest).pipe(
      switchMap((accessToken) => {
        this.setAccessToken(accessToken);
        return this.getCurrentUserInfo().pipe(
          map(() => {
            return accessToken;
          })
        );
      }),
      catchError((error) => {
        this._errorMessage.set('Email/Mot de passe incorrect !');
        throw error;
      })
    );
  }

  /**
   * Need to be reimplemented
   *
   */
  public verifyToken(): Observable<VerifyTokenQueryResponse> {
    return this._authService.authControllerVerifyTokenV1();
  }

  public getCurrentUserInfo(): Observable<GetMeQueryResponse> {
    this._loadingUserInfo.set(true);
    this._connectedUser.set(null);
    return this._authService.authControllerMeV1().pipe(
      shareReplay(1),
      tap((userInfo) => {
        this._connectedUser.set(userInfo);
      }),
      finalize(() => this._loadingUserInfo.set(false))
    );
  }

  public loadAccessToken(): string | null {
    // when the token is used, I should load user information
    if (!this._accessToken()) {
      const storage = JSON.parse(
        this.storage.getItem(TOKEN_STORAGE_KEY) || ''
      ) as AccessTokenResponse | null;
      if (storage === null) return null;
      this._accessToken.set(storage.accessToken);
      this.tokenExpiresIn.set(Math.ceil(storage.expiresIn / 100));
    }
    if (!this._connectedUser() && !this._loadingUserInfo()) {
      this.getCurrentUserInfo().subscribe();
    }
    return this.accessToken();
  }

  public refreshToken(
    refreshRequest: RefreshTokenCommand
  ): Observable<AccessTokenResponse> {
    return this._authService
      .authControllerRefreshTokenV1(refreshRequest)
      .pipe(tap((accessToken) => this.setAccessToken(accessToken)));
  }

  public logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this._connectedUser.set(null);
    this._accessToken.set(null);
    this._router.navigate(['/auth', 'login']);
  }

  private setAccessToken(accessToken: AccessTokenResponse): void {
    this.tokenExpiresIn.set(Math.ceil(accessToken.expiresIn / 100));
    this._accessToken.set(accessToken.accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(accessToken));
  }
}
