import { Route } from '@angular/router';

export const workflowRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/workflow-listing/workflow-listing.component').then(
        (m) => m.WorkflowListingComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./containers/workflow-builder/workflow-builder.component').then(
        (m) => m.WorkflowBuilderComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./containers/workflow-builder/workflow-builder.component').then(
        (m) => m.WorkflowBuilderComponent
      ),
  },
  {
    path: ':id/executions',
    loadComponent: () =>
      import(
        './containers/execution-list/workflow-execution-list.component'
      ).then((m) => m.WorkflowExecutionListComponent),
  },
  {
    path: 'executions/:executionId',
    loadComponent: () =>
      import(
        './containers/execution-detail/workflow-execution-detail.component'
      ).then((m) => m.WorkflowExecutionDetailComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./containers/dashboard/workflow-dashboard.component').then(
        (m) => m.WorkflowDashboardComponent
      ),
  },
];

export default workflowRoutes;
