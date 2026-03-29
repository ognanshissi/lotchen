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
import {
  FindAllPoliciesQueryResponse,
  FindAllProductsQueryResponse,
  PoliciesApiService,
  ProductsApiService,
} from '@talisoft/api/lotchen-client-api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';

@Component({
  selector: 'settings-products',
  standalone: true,
  imports: [CommonModule, TasTitle, TasText, TasCard, TasIcon, ButtonModule],
  templateUrl: 'products-settings.component.html',
})
export class ProductsSettingsComponent implements OnInit {
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _http = inject(HttpClient);
  private readonly _productsApiService = inject(ProductsApiService);
  private readonly _policiesApiService = inject(PoliciesApiService);
  private readonly _confirmationService = inject(ConfirmDialogService);

  public activeTab = signal<'financial' | 'insurance' | 'policies'>(
    'financial'
  );
  public allProducts = signal<FindAllProductsQueryResponse[]>([]);
  public policies = signal<FindAllPoliciesQueryResponse[]>([]);

  public financialProducts = signal<FindAllProductsQueryResponse[]>([]);
  public insuranceProducts = signal<FindAllProductsQueryResponse[]>([]);

  public ngOnInit(): void {
    this.loadProducts();
    this.loadPolicies();
  }

  public loadProducts(): void {
    this._productsApiService.productControllerFindAllV1().subscribe({
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
    this._policiesApiService.policyControllerFindAllV1().subscribe({
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
    this._confirmationService.confirm({
      title: `Promouvoir "${product.name}" en production ?`,
      message: 'Cette action est irréversible. Veuillez confirmer.',
      closable: true,
      acceptButtonProps: {
        label: 'Oui, promouvoir',
        theme: 'primary',
        icon: 'feather:check',
      },
      accept: () => {
        this._productsApiService
          .productControllerPromoteV1(product.id)
          .subscribe({
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
      },
    });
  }

  public demoteProduct(product: ProductResponse): void {
    this._confirmationService.confirm({
      title: `Rétrograder "${product.name}" en sandbox ?`,
      message: `Êtes-vous sûr de vouloir rétrograder "${product.name}" en sandbox ? Cette action est irréversible.`,
      closable: false,
      accept: () => {
        this._productsApiService
          .productControllerDemoteV1(product.id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Produit rétrogradé en sandbox');
              this.loadProducts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de rétrograder le produit'
              );
            },
          });
      },
    });
  }

  public deleteProduct(product: ProductResponse): void {
    this._confirmationService.confirm({
      title: `Supprimer le produit "${product.name}" ?`,
      message: `Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`,
      closable: false,
      accept: () => {
        this._productsApiService
          .productControllerDeleteV1(product.id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Produit supprimé');
              this.loadProducts();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                'Impossible de supprimer le produit'
              );
            },
          });
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
