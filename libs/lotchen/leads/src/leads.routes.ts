import { Route } from '@angular/router';
import { LeadListingComponent } from './containers/lead-listing/lead-listing.component';
import { leadDetailResolver } from './services/lead-detail-resolver.service';
import { LeadDetailNavigationComponent } from './components/lead-detail-navigation/lead-detail-navigation.component';
import { LeadDetailOverviewComponent } from './containers/lead-detail/lead-detail-overview/lead-detail-overview.component';

export const leadRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => LeadListingComponent,
  },
  {
    path: ':id',
    loadComponent: () => LeadDetailNavigationComponent,
    resolve: {
      lead: leadDetailResolver,
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () => LeadDetailOverviewComponent,
      },
    ],
  },
];
