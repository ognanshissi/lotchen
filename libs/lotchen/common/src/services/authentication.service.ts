import { afterNextRender, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import {
  AccessTokenResponse,
  AuthApiService,
  LoginCommand,
  RefreshTokenCommand,
} from '@talisoft/api/lotchen-client-api';

export const TOKEN_STORAGE_KEY = 'LOTCHEN_ACCESS_TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private storage!: Storage;

  private readonly _authService = inject(AuthApiService);
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
    return this._authService.authControllerLoginV1(loginRequest).pipe(
      tap((accessToken) => this.setAccessToken(accessToken)),
      catchError((error) => {
        this._errorMessage.set('Email/Mot de passe incorrect !');
        throw error;
      })
    );
  }

  /**
   * Need to be reimplemented
   *
   * TODO: Create an api that will be used to verify the token
   */
  public verifyToken(): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  public loadAccessToken(): string | null {
    if (this._accessToken()) return this.accessToken();
    if (this.storage === undefined) return null;
    const storage = JSON.parse(
      this.storage.getItem(TOKEN_STORAGE_KEY) || ''
    ) as AccessTokenResponse | null;
    if (storage === null) return null;
    this._accessToken.set(storage.accessToken);
    return storage.accessToken;
  }

  public refreshToken(
    refreshRequest: RefreshTokenCommand
  ): Observable<AccessTokenResponse> {
    return this._authService
      .authControllerRefreshTokenV1(refreshRequest)
      .pipe(tap((accessToken) => this.setAccessToken(accessToken)));
  }

  private setAccessToken(accessToken: AccessTokenResponse): void {
    this.tokenExpiresIn.set(Math.ceil(accessToken.expiresIn / 100));
    this._accessToken.set(accessToken.accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(accessToken));
  }
}
