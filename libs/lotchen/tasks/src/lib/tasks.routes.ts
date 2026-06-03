import { Routes } from '@angular/router';
import TasksComponent from './containers/tasks.component';

export const tasksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => TasksComponent,
  },
];
