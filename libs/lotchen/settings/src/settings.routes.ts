import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/overview/overview.component'),
  },
];
