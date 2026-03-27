import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { TasIconRegistry } from '@talisoft/ui/icon';
import { BASE_PATH as BASE_PATH_LOTCHEN_API } from '@talisoft/api/lotchen-client-api';
import { environment } from '../environments/environment';
import { accessTokenInterceptor } from '@lotchen/lotchen/common/interceptors/access-token.interceptor';
import { ENVIRONMENT_CONFIG } from '@lotchen/lotchen/common/utils';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([accessTokenInterceptor])),
    importProvidersFrom(TasIconRegistry),
    {
      provide: BASE_PATH_LOTCHEN_API,
      useValue: environment.apiUrl,
    },
    {
      provide: ENVIRONMENT_CONFIG,
      useValue: environment,
    },
  ],
};
