import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasText } from '@talisoft/ui/text';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ProductResponse, PolicyResponse } from './products.interfaces';
import { AddProductDialogComponent } from '../../components/add-product-dialog/add-product-dialog.component';
import { ProductDetailDialogComponent } from '../../components/product-detail-dialog/product-detail-dialog.component';
import { AddPolicyDialogComponent } from '../../components/add-policy-dialog/add-policy-dialog.component';

@Component({
  selector: 'settings-products',
  standalone: true,
  imports: [CommonModule, TasTitle, TasText, TasCard, TasIcon, ButtonModule],
  template: `
    <div class="py-8 px-6 bg-white">
      <div class="flex justify-between items-center">
        <div>
          <tas-title>Produits & Services</tas-title>
          <tas-text
            >Gérer le catalogue de produits et les polices d'assurance</tas-text
          >
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-200">
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          [class.border-primary]="activeTab() === 'financial'"
          [class.text-primary]="activeTab() === 'financial'"
          [class.border-transparent]="activeTab() !== 'financial'"
          [class.text-gray-500]="activeTab() !== 'financial'"
          (click)="activeTab.set('financial')"
        >
          Produits financiers
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          [class.border-primary]="activeTab() === 'insurance'"
          [class.text-primary]="activeTab() === 'insurance'"
          [class.border-transparent]="activeTab() !== 'insurance'"
          [class.text-gray-500]="activeTab() !== 'insurance'"
          (click)="activeTab.set('insurance')"
        >
          Produits d'assurance
        </button>
        <button
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          [class.border-primary]="activeTab() === 'policies'"
          [class.text-primary]="activeTab() === 'policies'"
          [class.border-transparent]="activeTab() !== 'policies'"
          [class.text-gray-500]="activeTab() !== 'policies'"
          (click)="activeTab.set('policies')"
        >
          Polices d'assurance
        </button>
      </div>

      <!-- Financial Products Tab -->
      @if (activeTab() === 'financial') {
      <div class="flex justify-end mb-4">
        <button
          tas-raised-button
          color="primary"
          (click)="openAddProductDialog('loan')"
        >
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter un produit
        </button>
      </div>
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">Nom</th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Type
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Statut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Environnement
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Taux d'intérêt
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Durée (mois)
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (product of financialProducts(); track product.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ product.name }}</td>
              <td class="py-3 px-4">
                {{ product.type === 'loan' ? 'Prêt' : 'Épargne' }}
              </td>
              <td class="py-3 px-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  [class.bg-gray-100]="product.status === 'draft'"
                  [class.text-gray-600]="product.status === 'draft'"
                  [class.bg-green-100]="product.status === 'active'"
                  [class.text-green-800]="product.status === 'active'"
                  [class.bg-orange-100]="product.status === 'deprecated'"
                  [class.text-orange-800]="product.status === 'deprecated'"
                  >{{ getStatusLabel(product.status) }}</span
                >
              </td>
              <td class="py-3 px-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  [class.bg-yellow-100]="product.environment === 'sandbox'"
                  [class.text-yellow-800]="product.environment === 'sandbox'"
                  [class.bg-blue-100]="product.environment === 'production'"
                  [class.text-blue-800]="product.environment === 'production'"
                  >{{
                    product.environment === 'sandbox' ? 'Sandbox' : 'Production'
                  }}</span
                >
              </td>
              <td class="py-3 px-4">
                {{ product.interestRate ? product.interestRate + '%' : '-' }}
              </td>
              <td class="py-3 px-4">{{ product.duration || '-' }}</td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openProductDetail(product)"
                >
                  <tas-icon iconName="feather:eye"></tas-icon>
                </button>
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditProductDialog(product)"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
                @if (product.environment === 'sandbox') {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-green-600"
                  (click)="promoteProduct(product)"
                >
                  <tas-icon iconName="feather:arrow-up-circle"></tas-icon>
                </button>
                } @else {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-orange-500"
                  (click)="demoteProduct(product)"
                >
                  <tas-icon iconName="feather:arrow-down-circle"></tas-icon>
                </button>
                }
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-red-500"
                  (click)="deleteProduct(product)"
                >
                  <tas-icon iconName="feather:trash-2"></tas-icon>
                </button>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="7" class="py-8 text-center text-gray-400">
                Aucun produit financier
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
      }

      <!-- Insurance Products Tab -->
      @if (activeTab() === 'insurance') {
      <div class="flex justify-end mb-4">
        <button
          tas-raised-button
          color="primary"
          (click)="openAddProductDialog('insurance')"
        >
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter un produit
        </button>
      </div>
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">Nom</th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Type d'assurance
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Statut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Environnement
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Couverture
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Franchise
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (product of insuranceProducts(); track product.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ product.name }}</td>
              <td class="py-3 px-4">
                {{ getInsuranceTypeLabel(product.insuranceType) }}
              </td>
              <td class="py-3 px-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  [class.bg-gray-100]="product.status === 'draft'"
                  [class.text-gray-600]="product.status === 'draft'"
                  [class.bg-green-100]="product.status === 'active'"
                  [class.text-green-800]="product.status === 'active'"
                  [class.bg-orange-100]="product.status === 'deprecated'"
                  [class.text-orange-800]="product.status === 'deprecated'"
                  >{{ getStatusLabel(product.status) }}</span
                >
              </td>
              <td class="py-3 px-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  [class.bg-yellow-100]="product.environment === 'sandbox'"
                  [class.text-yellow-800]="product.environment === 'sandbox'"
                  [class.bg-blue-100]="product.environment === 'production'"
                  [class.text-blue-800]="product.environment === 'production'"
                  >{{
                    product.environment === 'sandbox' ? 'Sandbox' : 'Production'
                  }}</span
                >
              </td>
              <td class="py-3 px-4">{{ product.coverage || '-' }}</td>
              <td class="py-3 px-4">{{ product.deductible || '-' }}</td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openProductDetail(product)"
                >
                  <tas-icon iconName="feather:eye"></tas-icon>
                </button>
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditProductDialog(product)"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
                @if (product.environment === 'sandbox') {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-green-600"
                  (click)="promoteProduct(product)"
                >
                  <tas-icon iconName="feather:arrow-up-circle"></tas-icon>
                </button>
                } @else {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-orange-500"
                  (click)="demoteProduct(product)"
                >
                  <tas-icon iconName="feather:arrow-down-circle"></tas-icon>
                </button>
                }
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-red-500"
                  (click)="deleteProduct(product)"
                >
                  <tas-icon iconName="feather:trash-2"></tas-icon>
                </button>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="7" class="py-8 text-center text-gray-400">
                Aucun produit d'assurance
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
      }

      <!-- Policies Tab -->
      @if (activeTab() === 'policies') {
      <div class="flex justify-end mb-4">
        <button
          tas-raised-button
          color="primary"
          (click)="openAddPolicyDialog()"
        >
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter une police
        </button>
      </div>
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                N° Police
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Produit
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Contact
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Statut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Date début
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Date fin
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Prime
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (policy of policies(); track policy.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ policy.policyNumber }}</td>
              <td class="py-3 px-4">{{ getProductName(policy.productId) }}</td>
              <td class="py-3 px-4">{{ policy.contactId }}</td>
              <td class="py-3 px-4">
                <span
                  class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800"
                >
                  {{ getPolicyStatusLabel(policy.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                {{
                  policy.startDate
                    ? (policy.startDate | date : 'dd/MM/yyyy')
                    : '-'
                }}
              </td>
              <td class="py-3 px-4">
                {{
                  policy.endDate ? (policy.endDate | date : 'dd/MM/yyyy') : '-'
                }}
              </td>
              <td class="py-3 px-4">{{ policy.premiumAmount || '-' }}</td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditPolicyDialog(policy)"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="8" class="py-8 text-center text-gray-400">
                Aucune police d'assurance
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
      }
    </div>
  `,
})
export class ProductsSettingsComponent implements OnInit {
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _http = inject(HttpClient);

  public activeTab = signal<'financial' | 'insurance' | 'policies'>(
    'financial'
  );
  public allProducts = signal<ProductResponse[]>([]);
  public policies = signal<PolicyResponse[]>([]);

  public financialProducts = signal<ProductResponse[]>([]);
  public insuranceProducts = signal<ProductResponse[]>([]);

  public ngOnInit(): void {
    this.loadProducts();
    this.loadPolicies();
  }

  public loadProducts(): void {
    this._http.get<ProductResponse[]>('/api/v1/products').subscribe({
      next: (data) => {
        this.allProducts.set(data);
        this.financialProducts.set(
          data.filter((p) => p.type === 'loan' || p.type === 'savings')
        );
        this.insuranceProducts.set(data.filter((p) => p.type === 'insurance'));
      },
    });
  }

  public loadPolicies(): void {
    this._http.get<PolicyResponse[]>('/api/v1/policies').subscribe({
      next: (data) => this.policies.set(data),
    });
  }

  public getProductName(productId: string): string {
    return (
      this.allProducts().find((p) => p.id === productId)?.name || productId
    );
  }

  public getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      deprecated: 'Déprécié',
    };
    return labels[status] || status;
  }

  public getInsuranceTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      life: 'Vie',
      health: 'Santé',
      property: 'Biens',
    };
    return type ? labels[type] || type : '-';
  }

  public getPolicyStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      quote: 'Devis',
      application: 'Demande',
      underwriting: 'Souscription',
      active: 'Active',
      renewal: 'Renouvellement',
      lapsed: 'Expirée',
    };
    return labels[status] || status;
  }

  public openAddProductDialog(defaultType: string): void {
    const ref = this._dialog.open(AddProductDialogComponent, {
      width: '600px',
      data: { mode: 'create', defaultType },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadProducts();
    });
  }

  public openEditProductDialog(product: ProductResponse): void {
    const ref = this._dialog.open(AddProductDialogComponent, {
      width: '600px',
      data: { mode: 'edit', product },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadProducts();
    });
  }

  public openProductDetail(product: ProductResponse): void {
    const ref = this._dialog.open(ProductDetailDialogComponent, {
      width: '600px',
      data: { product },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadProducts();
    });
  }

  public promoteProduct(product: ProductResponse): void {
    if (!confirm(`Promouvoir "${product.name}" en production ?`)) return;
    this._http.patch(`/api/v1/products/${product.id}/promote`, {}).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Produit promu en production');
        this.loadProducts();
      },
      error: (err: { error?: { message?: string } }) => {
        this._snackbar.error(
          'Erreur',
          err?.error?.message || 'Impossible de promouvoir le produit'
        );
      },
    });
  }

  public demoteProduct(product: ProductResponse): void {
    if (!confirm(`Rétrograder "${product.name}" en sandbox ?`)) return;
    this._http.patch(`/api/v1/products/${product.id}/demote`, {}).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Produit rétrogradé en sandbox');
        this.loadProducts();
      },
      error: () => {
        this._snackbar.error('Erreur', 'Impossible de rétrograder le produit');
      },
    });
  }

  public deleteProduct(product: ProductResponse): void {
    if (!confirm(`Supprimer le produit "${product.name}" ?`)) return;
    this._http.delete(`/api/v1/products/${product.id}`).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Produit supprimé');
        this.loadProducts();
      },
      error: () => {
        this._snackbar.error('Erreur', 'Impossible de supprimer le produit');
      },
    });
  }

  public openAddPolicyDialog(): void {
    const ref = this._dialog.open(AddPolicyDialogComponent, {
      width: '600px',
      data: {
        mode: 'create',
        products: this.allProducts().filter(
          (p) => p.status === 'active' && p.environment === 'production'
        ),
      },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadPolicies();
    });
  }

  public openEditPolicyDialog(policy: PolicyResponse): void {
    const ref = this._dialog.open(AddPolicyDialogComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        policy,
        products: this.allProducts().filter(
          (p) => p.status === 'active' && p.environment === 'production'
        ),
      },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadPolicies();
    });
  }
}

export default ProductsSettingsComponent;
