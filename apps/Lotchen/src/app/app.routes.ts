import { Route } from '@angular/router';
import { AuthLayoutComponent } from '@talisoft/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: "auth",
    pathMatch: "full",
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import("@talisoft/auth")
  },
  {
    path: "dashboard",
    loadChildren: () => import("@talisoft/dashboard")
  }
];
