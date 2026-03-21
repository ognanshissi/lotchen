import { Route } from '@angular/router';

export const campaignRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/campaign-listing/campaign-listing.component'),
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('./containers/template-listing/template-listing.component'),
  },
  {
    path: 'templates/create',
    loadComponent: () =>
      import('./containers/template-form/template-form.component'),
  },
  {
    path: 'templates/:id/edit',
    loadComponent: () =>
      import('./containers/template-form/template-form.component'),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./containers/campaign-form/campaign-form.component'),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./containers/campaign-form/campaign-form.component'),
  },
  {
    path: ':id/analytics',
    loadComponent: () =>
      import('./containers/campaign-analytics/campaign-analytics.component'),
  },
];
