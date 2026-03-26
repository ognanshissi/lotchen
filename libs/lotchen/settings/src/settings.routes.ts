import { Routes } from '@angular/router';
import RolesComponent from './containers/roles/roles.component';
import UsersComponent from './containers/users/users.component';
import OverviewComponent from './containers/overview/overview.component';
import UserAddComponent from './containers/users/user-add/user-add.component';
import TeamsComponent from './containers/teams/teams.component';
import TerritoriesComponent from './containers/territories/territories.component';
import { RoleEditComponent } from './containers/roles/role-edit/role-edit.component';
import UserEditComponent from './containers/users/user-edit/user-edit.component';
import { userDetailResolverService } from './services/user-detail.resolver.service';

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
    path: 'users/:id',
    loadComponent: () => UserEditComponent,
    resolve: {
      detail: userDetailResolverService,
    },
  },
  {
    path: 'roles',
    loadComponent: () => RolesComponent,
  },
  {
    path: 'roles/:roleId/edit',
    loadComponent: () => RoleEditComponent,
  },
  {
    path: 'territories',
    loadComponent: () => TerritoriesComponent,
  },
  {
    path: 'teams',
    loadComponent: () => TeamsComponent,
  },
  {
    path: 'event-types',
    loadComponent: () =>
      import('./containers/event-types/event-types.component'),
  },
  {
    path: 'telephony',
    loadComponent: () =>
      import('./containers/telephony/telephony-settings.component'),
  },
  {
    path: 'currency',
    loadComponent: () =>
      import('./containers/currency/currency-settings.component'),
  },
];
