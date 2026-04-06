import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data } from '@angular/router';
import { TasCard } from '@talisoft/ui/card';
import { map, Observable } from 'rxjs';
import { ClientDetailDto } from '../../../services/clients-api.service';

@Component({
  selector: 'clients-detail-products',
  standalone: true,
  imports: [TasCard],
  template: `
    <tas-card class="p-4">
      <h2 class="text-2xl font-semibold mb-4">Produits & Polices</h2>
      @if (client()?.productIds?.length || client()?.policyIds?.length) {
      <div class="space-y-2">
        @for (pid of client()?.productIds ?? []; track pid) {
        <div class="p-3 bg-gray-50 rounded">Produit: {{ pid }}</div>
        } @for (pid of client()?.policyIds ?? []; track pid) {
        <div class="p-3 bg-gray-50 rounded">Police: {{ pid }}</div>
        }
      </div>
      } @else {
      <p class="text-gray-500">Aucun produit ou police associé.</p>
      }
    </tas-card>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailProductsComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  public client = toSignal(
    (this._activatedRoute?.parent?.data as Observable<Data>).pipe(
      map((data) => data['client'] as ClientDetailDto)
    )
  );
}

export default ClientDetailProductsComponent;
