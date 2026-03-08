import { Route } from '@angular/router';
import { ContactListingComponent } from './containers/contact-listing/contact-listing.component';
import { contactDetailResolver } from './services/contact-detail-resolver.service';
import { DetailNavigationComponent } from './components/detail-navigation/detail-navigation.component';
import { ContactDetailOverviewComponent } from './containers/contact-detail/contact-detail-overview/contact-detail-overview.component';
import { ContactDetailActivitiesComponent } from './containers/contact-detail/contact-detail-activities/contact-detail-activities.component';
import { ContactDetailNotesComponent } from './containers/contact-detail/contact-detail-notes/contact-detail-notes.component';
import { ContactDetailCallLogsComponent } from './containers/contact-detail/contact-detail-call-logs/contact-detail-call-logs.component';
import { ContactDetailDocumentsComponent } from './containers/contact-detail/contact-detail-documents/contact-detail-documents.component';

export const prospectRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => ContactListingComponent,
  },
  {
    path: ':id',
    loadComponent: () => DetailNavigationComponent,
    resolve: {
      contact: contactDetailResolver,
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
      {
        path: 'activities',
        loadComponent: () => ContactDetailActivitiesComponent,
      },
      {
        path: 'notes',
        loadComponent: () => ContactDetailNotesComponent,
      },
      {
        path: 'call-logs',
        loadComponent: () => ContactDetailCallLogsComponent,
      },
      {
        path: 'documents',
        loadComponent: () => ContactDetailDocumentsComponent,
      },
    ],
  },
];
