import { Route } from '@angular/router';
import {
  AuthLayoutComponent,
  PortalLayoutComponent,
} from '@lotchen/lotchen/common/components';
import { authorized } from '@lotchen/lotchen/common/guards/authorized.guard';

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
        loadChildren: () => import('@lotchen/lotchen/dashboard'),
      },
      {
        path: 'contacts',
        loadChildren: () => import('@lotchen/lotchen/prospects'),
      },
      {
        path: 'leads',
        loadChildren: () => import('@lotchen/lotchen/leads'),
      },
      {
        path: 'events',
        loadChildren: () => import('@lotchen/lotchen/events'),
      },
    ],
  },
  {
    path: 'settings',
    component: PortalLayoutComponent,
    loadChildren: () => import('@lotchen/lotchen/settings'),
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
