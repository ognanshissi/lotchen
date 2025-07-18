import { Route } from '@angular/router';
import { ContactListingComponent } from './containers/contact-listing/contact-listing.component';
import { contactDetailResover } from './services/contact-detail-resolver.service';
import { DetailNavigationComponent } from './components/detail-navigation/detail-navigation.component';
import { ContactDetailOverviewComponent } from './containers/contact-detail/contact-detail-overview/contact-detail-overview.component';

export const prospectRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => ContactListingComponent,
  },
  {
    path: ':id',
    loadComponent: () => DetailNavigationComponent,
    resolve: {
      contact: contactDetailResover,
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () => ContactDetailOverviewComponent,
      },
    ],
  },
];
