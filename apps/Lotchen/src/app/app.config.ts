import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TasIconRegistry } from '@talisoft/ui/icon';
import { BASE_PATH } from '@talisoft/api';
import { environment } from '../environments/environment';
import { ENVIRONMENT_CONFIG } from '@talisoft/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
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
