import { Routes } from '@angular/router';
import TaskListComponent from './containers/task-list/task-list.component';

export const tasksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => TaskListComponent,
  },
];
