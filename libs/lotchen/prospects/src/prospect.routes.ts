import { Route } from '@angular/router';
import ContactDetailComponent from './containers/contact-detail/contact-detail.component';
import ProspectsHomepageComponent from './containers/prospects-homepage/prospects-homepage.component';
import { contactDetailResover } from './services/contact-detail-resolver.service';

export const prospectRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => ProspectsHomepageComponent,
  },
  {
    path: ':id',
    loadComponent: () => ContactDetailComponent,
    resolve: {
      contact: contactDetailResover,
    },
  },
];
