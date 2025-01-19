import { Route } from '@angular/router';
import {
  AuthLayoutComponent,
  authorized,
  PortalLayoutComponent,
} from '@lotchen/ui/common';

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
        loadChildren: () => import('@lotchen/ui/dashboard'),
      },
      {
        path: 'prospects',
        loadChildren: () => import('@lotchen/ui/prospects'),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@lotchen/ui/auth'),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
