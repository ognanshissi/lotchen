import { Routes } from '@angular/router';
import RolesComponent from './containers/roles/roles.component';
import UsersComponent from './containers/users/users.component';
import OverviewComponent from './containers/overview/overview.component';
import UserAddComponent from './containers/users/user-add/user-add.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => OverviewComponent,
  },
  {
    path: 'users',
    loadComponent: () => UsersComponent,
  },
  {
    path: 'users/create',
    loadComponent: () => UserAddComponent,
  },
  {
    path: 'roles',
    loadComponent: () => RolesComponent,
  },
  {
    path: 'territories',
    loadComponent: () =>
      import('./containers/territories/territories.component'),
  },
];
