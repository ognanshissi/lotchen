import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { TasCard } from '@talisoft/ui/card';

@Component({
  selector: 'prospects-contact-detail-documents',
  templateUrl: './contact-detail-documents.component.html',
  standalone: true,
  imports: [TasCard],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailDocumentsComponent {}
