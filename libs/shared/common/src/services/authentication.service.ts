import { inject, Injectable, signal } from '@angular/core';
import {
  AccessTokenResponse,
  HealthApiService,
  HealthVerifyAccessTokenResponse,
  IdentityApiService,
  LoginRequest,
  RefreshRequest,
} from '@talisoft/api';
import { Observable, tap } from 'rxjs';

export const TOKEN_STORAGE_KEY = 'LOTCHEN_ACCESS_TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly _identityApiService = inject(IdentityApiService);
  private readonly _healthApiService = inject(HealthApiService);
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

  public login(loginRequest: LoginRequest): Observable<AccessTokenResponse> {
    return this._identityApiService.loginPost(false, false, loginRequest).pipe(
      tap((accessToken) => this.setAccessToken(accessToken))
    );
  }

  public verifyToken(): Observable<HealthVerifyAccessTokenResponse>{
    return this._healthApiService.verifyAccessToken()
  }

  public loadAccessToken(): string | null {
    if (this._accessToken()) return this.accessToken();
    if (localStorage === null)  return null;
    const storage =  JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || "") as AccessTokenResponse | null;
    if (storage === null)  return null;
    this._accessToken.set(storage.accessToken);
    return storage.accessToken;
  }

  public refreshToken(
    refreshRequest: RefreshRequest
  ): Observable<AccessTokenResponse> {
    return this._identityApiService.refreshPost(refreshRequest).pipe(
      tap((accessToken) => this.setAccessToken(accessToken)),
    )
  }

  private setAccessToken(accessToken: AccessTokenResponse): void {
    this.tokenExpiresIn.set(Math.ceil(accessToken.expiresIn / 100));
    this._accessToken.set(accessToken.accessToken);
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify(accessToken)
    );
  }
}
