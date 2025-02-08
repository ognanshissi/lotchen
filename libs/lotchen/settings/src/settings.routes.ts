import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/overview/overview.component'),
  },
  {
    path: 'users',
    loadComponent: () => import('./containers/users/users.component'),
  },
];
