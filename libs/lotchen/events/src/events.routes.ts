import { Routes } from '@angular/router';

export const eventRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/events-calendar/events-calendar.component'),
  },
];
