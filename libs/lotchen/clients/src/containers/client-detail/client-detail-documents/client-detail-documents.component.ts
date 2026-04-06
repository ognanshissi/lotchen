import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { TasCard } from '@talisoft/ui/card';

@Component({
  selector: 'clients-detail-documents',
  standalone: true,
  imports: [TasCard],
  template: `
    <tas-card class="p-4">
      <h2 class="text-2xl font-semibold mb-4">Documents</h2>
      <p class="text-gray-500">
        La gestion des documents du client sera disponible prochainement.
      </p>
    </tas-card>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailDocumentsComponent {}

export default ClientDetailDocumentsComponent;
