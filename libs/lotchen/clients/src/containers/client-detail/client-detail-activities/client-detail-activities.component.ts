import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { TasCard } from '@talisoft/ui/card';

@Component({
  selector: 'clients-detail-activities',
  standalone: true,
  imports: [TasCard],
  template: `
    <tas-card class="p-4">
      <h2 class="text-2xl font-semibold mb-4">Activités</h2>
      <p class="text-gray-500">
        L'historique des activités du client sera affiché ici.
      </p>
    </tas-card>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailActivitiesComponent {}

export default ClientDetailActivitiesComponent;
