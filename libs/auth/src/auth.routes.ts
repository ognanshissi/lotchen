import { Routes } from '@angular/router';


export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import("./containers/login/login.component")
  }
]
