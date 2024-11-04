import { Route } from '@angular/router';
import { AuthLayoutComponent, PortalLayoutComponent } from '@talisoft/common';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@talisoft/auth'),
  },
  {
    path: 'portal',
    component: PortalLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('@talisoft/dashboard'),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
