import { Route } from '@angular/router';
import { ClientListingComponent } from './containers/client-listing/client-listing.component';
import { ClientDetailNavigationComponent } from './components/detail-navigation/detail-navigation.component';
import { clientDetailResolver } from './services/client-detail-resolver.service';
import { ClientDetailOverviewComponent } from './containers/client-detail/client-detail-overview/client-detail-overview.component';
import { ClientDetailActivitiesComponent } from './containers/client-detail/client-detail-activities/client-detail-activities.component';
import { ClientDetailProductsComponent } from './containers/client-detail/client-detail-products/client-detail-products.component';
import { ClientDetailDocumentsComponent } from './containers/client-detail/client-detail-documents/client-detail-documents.component';

export const clientRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => ClientListingComponent,
  },
  {
    path: ':id',
    loadComponent: () => ClientDetailNavigationComponent,
    resolve: { client: clientDetailResolver },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => ClientDetailOverviewComponent },
      {
        path: 'activities',
        loadComponent: () => ClientDetailActivitiesComponent,
      },
      { path: 'products', loadComponent: () => ClientDetailProductsComponent },
      {
        path: 'documents',
        loadComponent: () => ClientDetailDocumentsComponent,
      },
    ],
  },
];
