import { Route } from '@angular/router';
import {
  AuthLayoutComponent,
  PortalLayoutComponent,
} from '@lotchen/lotchen/common';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full',
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
        loadChildren: () => import('@lotchen/lotchen/dashboard'),
      },
      {
        path: 'prospects',
        loadChildren: () => import('@lotchen/lotchen/prospects'),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@lotchen/lotchen/auth'),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
