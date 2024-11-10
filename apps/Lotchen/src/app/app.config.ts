import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { TasIconRegistry } from '@talisoft/ui/icon';
import { BASE_PATH } from '@talisoft/api';
import { environment } from '../environments/environment';
import { accessTokenInterceptor, ENVIRONMENT_CONFIG } from '@talisoft/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([accessTokenInterceptor])),
    importProvidersFrom(TasIconRegistry),
    {
      provide: BASE_PATH,
      useValue: environment.apiUrl,
    },
    {
      provide: ENVIRONMENT_CONFIG,
      useValue: environment,
    },
  ],
};
