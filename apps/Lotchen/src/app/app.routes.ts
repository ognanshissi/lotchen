import { Route } from '@angular/router';
import {
  AuthLayoutComponent,
  authorized,
  noAuthorized,
  PortalLayoutComponent,
} from '@talisoft/common';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full',
  },
  {
    path: 'portal',
    component: PortalLayoutComponent,
    canActivate: [authorized],
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
      {
        path: 'prospects',
        loadChildren: () => import('@talisoft/prospects'),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [noAuthorized],
    component: AuthLayoutComponent,
    loadChildren: () => import('@talisoft/auth'),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
