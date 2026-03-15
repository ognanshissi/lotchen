import { Route } from '@angular/router';

export const pipelineRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/pipeline-listing/pipeline-listing.component').then(
        (m) => m.PipelineListingComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./containers/pipeline-form/pipeline-form.component').then(
        (m) => m.PipelineFormComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./containers/pipeline-form/pipeline-form.component').then(
        (m) => m.PipelineFormComponent
      ),
  },
  {
    path: ':id/board',
    loadComponent: () =>
      import('./containers/pipeline-board/pipeline-board.component').then(
        (m) => m.PipelineBoardComponent
      ),
  },
  {
    path: ':id/analytics',
    loadComponent: () =>
      import(
        './containers/pipeline-analytics/pipeline-analytics.component'
      ).then((m) => m.PipelineAnalyticsComponent),
  },
];

export default pipelineRoutes;
