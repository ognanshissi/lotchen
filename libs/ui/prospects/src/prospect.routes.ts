import { Route } from '@angular/router';

export const prospectRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/prospects-homepage/prospects-homepage.component'),
  },
];
