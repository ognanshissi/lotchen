import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./containers/login/login.component'),
  },
  {
    path: 'invitation-confirmation/:token',
    loadComponent: () =>
      import(
        './containers/invitation-confirmation/invitation-confirmation.component'
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./containers/forgot-password/forgot-password.component'),
  },
];
